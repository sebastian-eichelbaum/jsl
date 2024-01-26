<!--
Generates a background as large as the parent. The slot will be drawn on top.
-->

<template>
    <div id="wrapper">
        <div id="backgroundFilterLayer" :style="style" />
        <div id="background" />
        <div id="content">
            <slot />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

import { computedBackgroundStyle, makeBackgroundStyleProps } from "@jsl/utils/Style";

import AppCloseButton from "@jsl/components/AppCloseButton.vue";

const props = defineProps({
    image: { type: String, required: false, default: "none" },

    // generate blur, color, alpha, brightness props
    ...makeBackgroundStyleProps("", { color: "background", alpha: 0.0, brightness: 1.0, blur: 50 }),
});

const bgUrl = computed({
    get() {
        return "url(" + props.image + ")";
    },
});
const style = computedBackgroundStyle(props);
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

#background {
    width: 100vw;
    height: 100vh;

    background-image: v-bind("bgUrl");
    background-color: transparent;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
}

#backgroundFilterLayer {
    width: 100vw;
    height: 100vh;

    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
}

#content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
</style>
