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
                <component :is="canvasType" class="canvas" :id="canvasId" />

                <slot />
            </div>
        </div>
    </template>

    <template v-else>
        <div id="jslRenderViewWrapper">
            <component :is="canvasType" class="canvas" :id="canvasId" />

            <slot />
        </div>
    </template>
</template>

<script setup>
const props = defineProps({
    // The default color before your renderer/content engine takes over
    bgColor: { type: String, required: false, default: "#000000" },

    // The top/left/bottom/right position of the canvas. Allows to offset the canvas inside the wrapper.
    // Must be % or a unit like px/vh/vw/...
    canvasTop: { type: String, default: "0px" },
    canvasBottom: { type: String, default: "0px" },
    canvasLeft: { type: String, default: "0px" },
    canvasRight: { type: String, default: "0px" },

    // The id of the canvas itself. Use this in your renderer as the target id.
    canvasId: { type: String, required: true },

    // Depending on your renderer, the canvas should either be a div as container or a html canvas.
    canvasType: { type: String, default: "canvas" },

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
    background-color: v-bind("bgColor");

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

    width: calc(100% - v-bind("canvasLeft") - v-bind("canvasRight"));
    height: calc(100% - v-bind("canvasTop") - v-bind("canvasBottom"));

    position: absolute;
    top: v-bind("canvasTop");
    right: v-bind("canvasRight");
    bottom: v-bind("canvasBottom");
    left: v-bind("canvasLeft");
    z-index: 0;

    /* Prevents the babylonjs focus frame */
    outline: none;
}
</style>
