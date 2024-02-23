<!--
Base for all modal dialogs, popups and windows. This adds some background options that v-dialog lags.

It is a v-dialog and a nested v-card with some configuration options.
-->

<template>
    <v-dialog :scrim="false" v-model="model" v-bind="{ ...$props, ...$attrs }">
        <v-card :rounded="rounded" :color="color">
            <slot />
        </v-card>
    </v-dialog>
    <Teleport to="body" v-if="!contained">
        <v-fade-transition>
            <div class="ModalDialog-overlay" v-if="model" :style="style" />
        </v-fade-transition>
    </Teleport>
    <template v-else>
        <v-fade-transition>
            <div class="ModalDialog-overlay" v-if="model" :style="style" />
        </v-fade-transition>
    </template>
</template>

<script setup>
import { ref, computed, watch } from "vue";

import { makeBackgroundStyle, computedBackgroundStyle, makeBackgroundStyleProps } from "@jsl/utils/Style";

const model = defineModel();

const props = defineProps({
    // Define the color and style of the modal background.
    // Hint: if you want to brighten or darken, use brightness and set alpha to 0.0. If you also want to re-color, use
    // alpha and modal color.

    // Modal background style color, blur, alpha, brightness
    ...makeBackgroundStyleProps("modal", { color: "#000000", alpha: 0, brightness: 0.6, blur: 5 }),

    // For contained (nested in parent) modal dialogs:
    ...makeBackgroundStyleProps("containedModal", { color: "#000000", alpha: 0, brightness: 0.6, blur: 0, sat: 0.5 }),

    // Color of the dialog/v-card
    color: { required: false, default: "surface" },
    // The rounded-ness of the dialog v-card
    rounded: { type: String, default: "regular" },
    // Scroll: 'none' | 'close' | 'block' | 'reposition'
    // Keep in mind: setting block can trigger a re-layout as the scrollbar disappears.
    scrollStrategy: { type: String, default: "none" },

    // Should the dialog modal BG be inside the owner?
    contained: { type: Boolean, default: false },
});

// Set style to element directly as it is teleported to <body>
const style = props.contained
    ? computedBackgroundStyle(props, "containedModal")
    : computedBackgroundStyle(props, "modal");

const style2 = computed(() => {
    const style = props.contained
        ? makeBackgroundStyle(
              props.containedModalColor,
              props.containedModalAlpha,
              props.containedModalBrightness,
              props.containedModalBlur,
          )
        : makeBackgroundStyle(props.modalColor, props.modalAlpha, props.modalBrightness, props.modalBlur);

    console.log(style);
    return style;
});

const emit = defineEmits(["close", "open"]);

watch(model, (newValue, oldValue) => {
    if (newValue) {
        emit("open");
    }
    if (!newValue) {
        emit("close");
    }
});
</script>

<style scoped>
.ModalDialog-overlay {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: auto;

    z-index: 2002;
}
</style>
