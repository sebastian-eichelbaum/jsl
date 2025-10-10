<template>
    <Button
        @click.prevent="onClick"
        iconOnlyThreshold="sm"
        v-bind="{ ...$props, ...$attrs }"
        :text="showAsDark ? darkText : lightText"
        :icon="showAsDark ? darkIcon : lightIcon"
        :color="showAsDark ? darkColor : lightColor"
    >
        <span v-if="maxWidth != null" :style="cropStyle" class="text-truncate">
            <slot />
        </span>
        <span v-else>
            <slot />
        </span>
    </Button>
</template>

<script setup>
import { computed } from "vue";

import { tt, Translatable } from "jsl/Localization";

import Button from "jsl/components/Button.vue";
import { platform } from "jsl/Platform";
import { vuetify } from "jsl/Vuetify";

// Handle Clicks
function onClick() {
    vuetify.togglePreferredTheme();
}

const props = defineProps({
    variant: { default: "tonal" },
    rounded: { default: "xl" },

    // The icon to indicate light and dark mode switches
    lightIcon: { default: "mdi-white-balance-sunny" },
    darkIcon: { default: "mdi-weather-night" },

    // The button color for light and dark mode
    lightColor: { default: "yellow-darken-3" },
    darkColor: { default: "blue-darken-2" },

    // The text to indicate light and dark mode
    lightText: { type: [String, Translatable], default: tt("common.ui.light") },
    darkText: { type: [String, Translatable], default: tt("common.ui.dark") },

    maxWidth: { default: null },
});

const cropStyle = computed({
    get() {
        return "max-width:" + (props.maxWidth || "0") + "px";
    },
});

const showAsDark = computed(() => {
    return vuetify.isDarkRef.value == false;
});
</script>

<style scoped></style>
