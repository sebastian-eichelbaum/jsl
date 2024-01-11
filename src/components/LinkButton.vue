<template>
    <v-btn @click="onClick" :variant="variant" :rounded="rounded" :prepend-icon="icon" :color="color">
        <span v-if="maxWidth != null" :style="cropStyle" class="text-truncate">
            <slot>
                {{ href }}
            </slot>
        </span>
        <span v-else>
            <slot>
                {{ href }}
            </slot>
        </span>
    </v-btn>
</template>

<script setup>
import { computed } from "vue";
import { platform } from "@jsl/Platform";

// Handle Clicks
function onClick() {
    platform.openLink(props.href, true);
}

const props = defineProps({
    href: { type: String, required: true },
    variant: { type: String, required: false, default: "flat" },
    rounded: { type: String, required: false, default: "xl" },
    icon: { type: String, required: false, default: "mdi-link" },
    color: { type: String, required: false, default: "primary" },
    maxWidth: { type: String, required: false, default: null },
});

const cropStyle = computed({
    get() {
        return "max-width:" + (props.maxWidth || "0") + "px";
    },
});
</script>

<style scoped></style>
