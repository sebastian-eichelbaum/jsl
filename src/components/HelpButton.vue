<template>
    <Button iconOnlyThreshold="sm" v-bind="{ ...$props, ...$attrs }" @click="onClick"></Button>
</template>

<script setup>
import { tt, Translatable } from "jsl/Localization";

import Button from "jsl/components/Button.vue";

const props = defineProps({
    // The localized text
    text: { type: [String, Translatable], default: tt("common.ui.help") },

    // Default variant of the button
    variant: { default: "tonal" },

    // Icon used on the button. Can be null to disable
    icon: { default: "mdi-help-circle-outline" },

    // Rounded button by default.
    rounded: { type: String, default: "xl" },
});

const emit = defineEmits(["click"]);
function onClick() {
    emit("click");
}
</script>
