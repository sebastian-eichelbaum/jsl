<!--
Base for all modal dialogs, popups and windows. This adds some background options that v-dialog lags.

It is a v-dialog and a nested v-card with some configuration options.
-->

<template>
    <v-dialog
        :scrim="false"
        v-model="model"
        v-bind="{ ...$props, ...$attrs }"
    >
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
import { hexToCssRGBA } from "@jsl/utils/Color";

const model = defineModel();

const props = defineProps({
    // Define the color and style of the modal background.
    // Hint: if you want to brighten or darken, use brightness and set alpha to 0.0. If you also want to re-color, use
    // alpha and modal color.

    // Modal background blur intensity
    modalBlur: { required: false, default: "5px" },
    // Brightness of the background - In combination with alpha, the effect is dampened by alpha
    modalBrightness: { required: false, default: "0.6" },
    // Modal blur alpha
    modalAlpha: { required: false, default: "0.0" },
    // Modal blur color
    // Warning: does not work with anything EXCEPT 6 letter color hex.
    modalColor: { required: false, default: "#000000" },

    // For contained (nested in parent) modal dialogs:

    // Modal background blur intensity
    containedModalBlur: { required: false, default: "0px" },
    // Brightness of the background - In combination with alpha, the effect is dampened by alpha
    containedModalBrightness: { required: false, default: "0.6" },
    // Modal blur alpha
    containedModalAlpha: { required: false, default: "0.0" },
    // Modal blur color
    // Warning: does not work with anything EXCEPT 6 letter color hex.
    containedModalColor: { required: false, default: "#000000" },

    // Color of the dialog/v-card
    color: { required: false, default: "surface" },
    // The rounded-ness of the dialog v-card
    rounded: { type: String, default: "regular" },
    // Scroll: 'none' | 'close' | 'block' | 'reposition' 
    // Keep in mind: setting block can trigger a re-layout as the scrollbar disappears.
    scrollStrategy: { type: String, default: "none"},

    // Should the dialog modal BG be inside the owner?
    contained: { type: Boolean, default: false },
});

// Set style to element directly as it is teleported to <body>
const style = computed(() => {
    const makeStyle = (color, alpha, blur, brightness) => {
        return (
            "background-color: " +
            hexToCssRGBA(color, alpha) +
            ";" +
            "backdrop-filter: blur(" +
            blur +
            ") brightness(" +
            brightness +
            ");"
        );
    };

    const style = props.contained
        ? makeStyle(
              props.containedModalColor,
              props.containedModalAlpha,
              props.containedModalBlur,
              props.containedModalBrightness,
          )
        : makeStyle(props.modalColor, props.modalAlpha, props.modalBlur, props.modalBrightness);

    // console.log(style);
    return style;
});

const emit = defineEmits(["close"]);

watch(model, (newValue, oldValue) => {
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
