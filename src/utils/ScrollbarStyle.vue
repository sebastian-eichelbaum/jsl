<!-- 
A utility component that sets a scrollbar style for the whole HTML doc. This uses the jsl-scrollbar SCSS mixin to
generate a styled scrollbar for the HTML element.
-->

<template></template>

<script setup>
import { onMounted } from "vue";
import { computed } from "vue";

// import { vuetify } from "@jsl/Vuetify";

onMounted(() => {
    // console.log(vuetify.themeConfig);

    let root = document.documentElement;
    root.style.setProperty("--jsl-scrollbarColor", props.color);
    root.style.setProperty("--jsl-scrollbarBackground", props.background);
    root.style.setProperty("--jsl-scrollbarWidth", props.width);
    root.classList.add("jslapp-custom-scrollbar-html");
    if (props.autohide) {
        root.classList.add("jslapp-custom-scrollbar-html-autohide");
    }
});

const props = defineProps({
    color: { type: String, required: false, default: "#555" },
    background: { type: String, required: false, default: "rgba(16, 16, 16, 1)" },
    width: { type: String, required: false, default: "0.5rem" },
    autohide: { type: Boolean, required: false, default: false },
});

/*
TODO: make the scrollbars pickup the theme colors?
const color = computed({
    get() {
        return vuetify.themeConfig.colors["primary-darken-1"];
    },
});
*/
</script>

<style lang="scss">
@import "@jsl/styles/scrollbars.scss";

.jslapp-custom-scrollbar-html-autohide {
    overflow: auto !important;
}

.jslapp-custom-scrollbar-html {
    @include jsl-scrollbars(var(--jsl-scrollbarWidth), var(--jsl-scrollbarColor), var(--jsl-scrollbarBackground));
}
</style>
