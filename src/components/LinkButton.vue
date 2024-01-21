<template>
    <Button @click.prevent="onClick" v-bind="{ ...$props, ...$attrs }">
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
import { platform } from "@jsl/Platform";

import Button from "@jsl/components/Button.vue";

// Handle Clicks
function onClick() {
    platform.openLink(props.href, true);
}

const props = defineProps({
    href: { type: String, required: true },

    variant: { default: "flat" },
    rounded: { default: "xl" },
    icon: { default: "mdi-link" },
    color: { default: "primary" },
    maxWidth: { default: null },
});

const cropStyle = computed({
    get() {
        return "max-width:" + (props.maxWidth || "0") + "px";
    },
});
</script>

<style scoped></style>
