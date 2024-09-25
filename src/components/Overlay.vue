<!--
A style-able full-screen overlay. It is an absolute div to cover the whole screen.

* The anonymous slot is the content itself.
-->
<template>
    <Background v-bind="{ ...$props, ...$attrs }" v-model="model" absolute noBackground :contentClass="contentClasses">
        <div class="pa-5 pt-3 pb-3 titlebar" :style="titleBarStyle" v-if="allowSelfClose || title">
            <AppLogo v-if="appLogo" compact height="32px" clickOnly v-bind="fwdBindProps('appLogoProps', $props)" />
            <div :class="titleClass">{{ tt(title) }}</div>
            <BackButton
                v-if="allowSelfClose"
                size="small"
                icon="mdi-close"
                variant="flat"
                rounded="xl"
                hideText
                color="primary"
                doNotAsk
                v-bind="fwdBindProps('closeButtonProps', $props)"
                @yes="onClose"
            />
        </div>

        <slot>TODO: Put something in here.</slot>
    </Background>
</template>

<script setup>
import { ref, computed } from "vue";

import Background from "./Background.vue";
import BackButton from "jsl/components/BackButton.vue";
import AppLogo from "jsl/components/AppLogo.vue";

import { tt, Translatable } from "jsl/Localization";
import { fwdProps, fwdBindProps } from "jsl/utils/ForwardVueProps";

import { makeBackgroundStyleProps, computedBackgroundStyle, computedBackgroundStyleHidden } from "jsl/utils/Style";

// Visibility model
const model = defineModel({ default: false });

const props = defineProps({
    // The z-index. 1500 is above the app bar but below dialogs
    zIndex: { type: Number, default: 1500 },

    // Classes to apply to the content div.
    contentClass: { default: "" },

    // If set, the overlay will get a tiny title bar and a close button
    allowSelfClose: { type: Boolean, default: false },

    // If set, show the AppLogo component.
    appLogo: { type: Boolean, default: false },

    // If set, the overlay will show a title bar
    title: { type: [String, Translatable], default: undefined },

    // The classes for the title, if given
    titleClass: { default: "text-h4 font-weight-thin jsl-font-montserrat" },

    // Overlay background. Forwarded to the background component
    ...makeBackgroundStyleProps("", { color: "background", alpha: 0.0, brightness: 0.5, blur: 50 }),

    // Style of the titlebar if title or allowSelfClose is set
    ...makeBackgroundStyleProps("titleBar", { color: "background", alpha: 0.0, brightness: 0.5, blur: 50 }),

    // Nested item props
    ...fwdProps("closeButtonProps"),
    ...fwdProps("appLogoProps"),
});

const contentClasses = computed(() => {
    return "jslOverlayContent " + (props.contentClasses ? props.contentClasses : "");
});

const titleBarStyle = computed(() => {
    return model.value
        ? computedBackgroundStyle(props, "titleBar").value
        : computedBackgroundStyleHidden(props, "titleBar").value;
});

function onClose() {
    model.value = false;
}
</script>

<style>
.jslOverlayContent {
    overflow-x: auto;
    overflow-y: auto;
}
</style>

<style scoped>
.titlebar {
    transition: 0.5s;
    transition-delay: 0.5s;
    transition-property: opacity, filter, backdrop-filter, background-color;

    position: sticky;
    top: 0;
    height: 64px;

    display: flex;
    align-content: center;
    align-items: center;
    justify-content: space-between;

    z-index: 10;
}
</style>
