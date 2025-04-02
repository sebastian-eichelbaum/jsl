<!--
A style-able full-screen overlay. It is an absolute div to cover the whole screen.

* The anonymous slot is the content itself. It is position:relative to allow more flexible positioning.

Example:
    - Create an overlay that contains a v-container. In there, put a panel with logo, legal stuff and more.

    <Overlay
        allowSelfClose
        contentType="v-container"
        :contentProps="{ 'max-width': maxWidth }"
        v-bind="{ ...$props, ...$attrs }"
    >
        <Panel expand>
            <template #header>
                <AppLogo class="mb-10 mt-10" width="512" height="auto" max-width="100vw" />
            </template>
            TODO
            <template #footer>
                <MadeByCompany />
                <LegalLinks />
            </template>
        </Panel>
    </Overlay>
-->
<template>
    <Background v-bind="{ ...$props, ...$attrs }" v-model="model" absolute contentClass="jslOverlayContent">
        <div
            class="pa-5 pt-3 pb-3 titlebar"
            :style="
                _titleBarStyleEnabled
                    ? computedBackgroundStyle(props, 'titleBar').value
                    : computedBackgroundStyleHidden(props, 'titleBar').value
            "
            v-if="enableTitlebar"
        >
            <AppLogo
                v-if="appLogo"
                compact
                :width="_appLogoWidth"
                height="auto"
                max-height="32px"
                clickOnly
                v-bind="fwdBindProps('appLogoProps', $props)"
            />
            <div class="titleCenterShift" :class="titleClass">{{ tt(title) }}</div>
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
                :class="{ 'jsl-shadow-soft': !_titleBarStyleEnabled }"
            />
        </div>

        <component
            :is="contentType"
            :class="[contentClass, { ensureMinHeight: enableTitlebar, ensureMinHeightNoTitleBar: !enableTitlebar }]"
            v-bind="fwdBindProps('contentProps', $props)"
        >
            <slot>TODO: Put something in here.</slot>
        </component>
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
const model = defineModel({ default: true });

const props = defineProps({
    // The z-index. 1500 is above the app bar but below dialogs and menus
    // This is on purpose as overlays can be used as dialog background.
    zIndex: { type: Number, default: 1500 },

    // Classes to apply to the created component.
    contentClass: { default: "" },
    contentType: { default: "div" },
    ...fwdProps("contentProps"),

    // If set, the overlay will get a tiny title bar and a close button
    allowSelfClose: { type: Boolean, default: false },

    // If set, show the AppLogo component.
    appLogo: { type: Boolean, default: false },

    // If set, the overlay will show a title
    title: { type: [String, Translatable], default: undefined },

    // Height of the title bar
    titleBarHeight: { type: [String, Number], default: "64px" },

    // The classes for the title, if given
    titleClass: { default: "text-h4 font-weight-thin jsl-font-montserrat" },

    // Disable the visual titlebar. Title, Logo and Button are still visible though
    // Is set automatically if applogo and title are not given.
    noTitleBarStyling: { type: Boolean, default: false },

    // Overlay background. Forwarded to the background component
    ...makeBackgroundStyleProps("", { color: "transparent", alpha: 0.0, brightness: 0.5, blur: 50 }),

    // Style of the titlebar if title or allowSelfClose is set
    ...makeBackgroundStyleProps("titleBar", { color: "background", alpha: 0.0, brightness: 0.6, blur: 50 }),

    // Nested item props
    ...fwdProps("closeButtonProps"),
    ...fwdProps("appLogoProps"),
});

const enableTitlebar = computed(() => {
    return props.allowSelfClose || props.title || props.appLogo;
});

const contentClasses = computed(() => {
    return " " + (props.contentClass ? props.contentClass : "");
});

const _titleBarStyleEnabled = computed(() => {
    const titleAndLogoDisabled = props.title == null && props.appLogo !== true;
    return !props.noTitleBarStyling && model.value && !titleAndLogoDisabled;
});

// Required to move the title to make it centered
const _appLogoWidth = computed(() => {
    if (props.appLogo) {
        return "200px";
    }
    return "0px";
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
    left: 0;
    right: 0;
    height: v-bind(titleBarHeight);

    display: flex;
    align-content: center;
    align-items: center;
    justify-content: space-between;

    z-index: 10;
}

/* Moves the title to the left to ensure it is centered, if the appLogo is shown. */
.titleCenterShift {
    margin-left: calc(v-bind(_appLogoWidth) * -1);
}

.ensureMinHeight {
    min-height: calc(100% - v-bind(titleBarHeight));
    position: relative;

    display: grid;
}

.ensureMinHeightNoTitleBar {
    min-height: 100%;
    position: relative;

    display: grid;
}
</style>
