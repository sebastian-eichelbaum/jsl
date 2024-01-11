<!--
Generates a background as large as the parent. The slot will be drawn on top.
-->

<template>
    <div id="wrapper">
        <div id="backgroundblur" />
        <div id="background" />
        <div id="content">
            <slot />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

import { hexToCssRGBA } from "@jsl/utils/Color";

import AppCloseButton from "@jsl/components/AppCloseButton.vue";
const props = defineProps({
    image: { type: String, required: false, default: "none" },

    // Note: add the unit px!
    blur: { required: false, default: "50px" },
    alpha: { required: false, default: "0.4" },
    // Warning: does not work with anything EXCEPT 6 letter color hex.
    color: { required: false, default: "#000000" },
});

const bgUrl = computed({
    get() {
        return "url(" + props.image + ")";
    },
});
const bg = computed({
    get() {
        return hexToCssRGBA(props.color, props.alpha);
    },
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

#backgroundblur {
    width: 100vw;
    height: 100vh;

    background-color: v-bind("bg");
    backdrop-filter: blur(v-bind("blur"));
    transition: 0.5s;

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
