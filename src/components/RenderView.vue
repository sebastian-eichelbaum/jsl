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

                <div v-if="canvasEdgeFadeBottom" class="edgeFadeBottom" />
                <div v-if="canvasEdgeFadeTop" class="edgeFadeTop" />
                <div v-if="canvasEdgeFadeLeft" class="edgeFadeLeft" />
                <div v-if="canvasEdgeFadeRight" class="edgeFadeRight" />

                <slot />
            </div>
        </div>
    </template>

    <template v-else>
        <div id="jslRenderViewWrapper">
            <component :is="canvasType" class="canvas" :id="canvasId" />

            <div v-if="canvasEdgeFadeBottom" class="edgeFadeBottom" />
            <div v-if="canvasEdgeFadeTop" class="edgeFadeTop" />
            <div v-if="canvasEdgeFadeLeft" class="edgeFadeLeft" />
            <div v-if="canvasEdgeFadeRight" class="edgeFadeRight" />

            <slot />
        </div>
    </template>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    // The default color before your renderer/content engine takes over
    bgColor: { type: String, required: false, default: "#000000" },

    // The top/left/bottom/right position of the canvas. Allows to offset the canvas inside the wrapper.
    // Must be % or a unit like px/vh/vw/...
    canvasTop: { type: String, default: "0px" },
    canvasBottom: { type: String, default: "0px" },
    canvasLeft: { type: String, default: "0px" },
    canvasRight: { type: String, default: "0px" },

    // If set, the edges of the canvas smoothly fade from transparent to the bgColor
    canvasEdgeFadeTop: { type: Boolean, default: false },
    canvasEdgeFadeBottom: { type: Boolean, default: false },
    canvasEdgeFadeLeft: { type: Boolean, default: false },
    canvasEdgeFadeRight: { type: Boolean, default: false },

    // The fade size. The larger, the smoother the transition from canvas to edge
    canvasEdgeFadeSize: { type: String, default: "33px" },

    // The id of the canvas itself. Use this in your renderer as the target id.
    canvasId: { type: String, required: true },

    // Depending on your renderer, the canvas should either be a div as container or a html canvas.
    canvasType: { type: String, default: "canvas" },

    // The renderview is fixed to cover the whole viewport by default. If you want to place the render view inside
    // some other container, use relative.
    relative: { type: Boolean, default: false },
});

import { colorToRGB } from "jsl/utils/Style";
const rgb_bgColor = computed(() => {
    const c = colorToRGB(props.bgColor);
    return [c.r, c.g, c.b];
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
    --fade_color: v-bind("rgb_bgColor");

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

<style lang="scss">
@mixin grad($angle, $color) {
    & {
        // Thanks to https://non-boring-gradients.netlify.app/
        background: linear-gradient(
            $angle,
            rgba($color, 1) 0%,
            rgba($color, 0.9903926402016152) 6.25%,
            rgba($color, 0.9619397662556434) 12.5%,
            rgba($color, 0.9157348061512727) 18.75%,
            rgba($color, 0.8535533905932737) 25%,
            rgba($color, 0.7777851165098011) 31.25%,
            rgba($color, 0.6913417161825449) 37.5%,
            rgba($color, 0.5975451610080642) 43.75%,
            rgba($color, 0.5) 50%,
            rgba($color, 0.4024548389919359) 56.25%,
            rgba($color, 0.3086582838174552) 62.5%,
            rgba($color, 0.22221488349019902) 68.75%,
            rgba($color, 0.14644660940672627) 75%,
            rgba($color, 0.08426519384872733) 81.25%,
            rgba($color, 0.03806023374435663) 87.5%,
            rgba($color, 0.009607359798384785) 93.75%,
            rgba($color, 0) 100%
        );
    }
}

.edgeFadeBottom {
    bottom: v-bind("canvasBottom");
    position: absolute;
    width: 100%;
    height: v-bind(canvasEdgeFadeSize);

    @include grad(0deg, var(--fade_color));
}

.edgeFadeTop {
    top: v-bind("canvasTop");
    position: absolute;
    width: 100%;
    height: v-bind(canvasEdgeFadeSize);

    @include grad(180deg, var(--fade_color));
}

.edgeFadeLeft {
    left: v-bind("canvasLeft");
    position: absolute;
    width: v-bind(canvasEdgeFadeSize);
    height: 100%;

    @include grad(90deg, var(--fade_color));
}

.edgeFadeRight {
    right: v-bind("canvasRight");
    position: absolute;
    width: v-bind(canvasEdgeFadeSize);
    height: 100%;

    @include grad(270deg, var(--fade_color));
}
</style>
