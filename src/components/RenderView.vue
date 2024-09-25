<!--
Generates a full-size div that can be used to render into
-->

<template>
    <div id="wrapper">
        <div class="canvas" :id="canvasId">
            <slot />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    // The default color before your renderer/content engine takes over
    bgColor: { type: String, required: false, default: "#000000" },

    // The id of the canvas itself. Use this in your renderer as the target id.
    canvasId: { type: String, required: true },
});
</script>

<style scoped>
#wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.canvas {
    background-color: v-bind("bgColor");

    width: 100vw;
    height: 100vh;

    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
}
</style>
