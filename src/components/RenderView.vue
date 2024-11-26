<!--
Generates a full-size div that can be used to render into. It provides additional style-able panels at each corder/edge
in scoped slots.

Consider using RenderViewPanel to add overlays into the render canvas.

* The anonymous slot is a child of the wrapper and can be used to place overlays with position:absolute
-->

<template>
    <template v-if="!relative">
        <div id="fullscreenContainer">
            <div id="jslRenderViewWrapper">
                <div class="canvas" :id="canvasId"></div>

                <slot />
            </div>
        </div>
    </template>

    <template v-else>
        <div id="jslRenderViewWrapper">
            <div class="canvas" :id="canvasId"></div>

            <slot />
        </div>
    </template>
</template>

<script setup>
const props = defineProps({
    // The default color before your renderer/content engine takes over
    bgColor: { type: String, required: false, default: "#000000" },

    // The id of the canvas itself. Use this in your renderer as the target id.
    canvasId: { type: String, required: true },

    // The renderview is fixed to cover the whole viewport by default. If you want to place the render view inside
    // some other container, use relative.
    relative: { type: Boolean, default: false },
});
</script>

<style scoped>
#fullscreenContainer {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

#jslRenderViewWrapper {
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

    width: 100%;
    height: 100%;

    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
}
</style>
