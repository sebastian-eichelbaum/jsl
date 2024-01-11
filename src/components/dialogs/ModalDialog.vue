<!--
Base for all modal dialogs. This adds some background options that v-dialog lags.
-->

<template>
    <v-dialog
        id="ModalDialog-dialog"
        :scrim="false"
        v-model="model"
        v-bind="{ ...$props, ...$attrs }"
        @click:outside="$emit('close')"
    >
        <slot />
    </v-dialog>
    <Teleport to="body">
        <v-fade-transition>
            <div class="ModalDialog-overlay" v-if="model" :style="style" />
        </v-fade-transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { hexToCssRGBA } from "@jsl/utils/Color";

const model = defineModel();

const props = defineProps({
    modalBlur: { required: false, default: "10px" },
    modalAlpha: { required: false, default: "0.4" },
    // Warning: does not work with anything EXCEPT 6 letter color hex.
    modalColor: { required: false, default: "#000000" },
});

// Set style to element directly as it is teleported to <body>
const style = computed({
    get() {
        return (
            "background-color: " +
            hexToCssRGBA(props.modalColor, props.modalAlpha) +
            ";" +
            "backdrop-filter: blur(" +
            props.modalBlur +
            ");"
        );
    },
});

const emit = defineEmits(["close"]);
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
