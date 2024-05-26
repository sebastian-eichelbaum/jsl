<!-- 
A utility component that sets a scrollbar style for the whole HTML doc. This uses the jsl-scrollbar SCSS mixin to
generate a styled scrollbar for the HTML element.
-->

<template></template>

<script setup>
import { onMounted } from "vue";
import { computed } from "vue";

import { resolveColor } from "jsl/utils/Style";
import { useTheme } from "jsl/Vuetify";

const props = defineProps({
    // Thumber color. If unset, jsl.scrollbarFG or vuetify "surface" is used.
    color: { type: String, required: false, default: "" },
    // Background. If unset, jsl.scrollbarBG or vuetify "background" is used.
    background: { type: String, required: false, default: "" },

    width: { type: String, required: false, default: "0.5rem" },

    autohide: { type: Boolean, required: false, default: false },
});

const colFG = computed(() => {
    return resolveColor(props.color || useTheme()?.jsl?.scrollbarFG || "surface").toCSS();
});

const colBG = computed(() => {
    return resolveColor(props.background || useTheme()?.jsl?.scrollbarBG || "background").toCSS();
});

onMounted(() => {
    // console.log(vuetify.themeConfig);

    let root = document.documentElement;
    root.style.setProperty("--jsl-scrollbarColor", colFG.value);
    root.style.setProperty("--jsl-scrollbarBackground", colBG.value);
    root.style.setProperty("--jsl-scrollbarWidth", props.width);
    root.classList.add("jslapp-custom-scrollbar-html");
    if (props.autohide) {
        root.classList.add("jslapp-custom-scrollbar-html-autohide");
    }
});
</script>

<style lang="scss">
@import "jsl/styles/scrollbars.scss";

.jslapp-custom-scrollbar-html-autohide {
    overflow: auto !important;
}

.jslapp-custom-scrollbar-html {
    // This is required as the default main scss sets this to auto. This causes size changes whenever a dialog opens.
    overflow-x: hidden;
    overflow-y: unset;
    @include jsl-scrollbars(var(--jsl-scrollbarWidth), var(--jsl-scrollbarColor), var(--jsl-scrollbarBackground));
}
</style>
