<!--
An AppBar that provides some common functions

* Anonymous slot: set to override the whole right hand side of the app bar. By default, this contains the shop button,
language switcher and the user button.
* Slot "append": allows to add content to the right of the anonymous slot. Use this if the default should be kept but
extended.

Both slots get "disabled" bound
-->
<template>
    <v-app-bar :style="isFullscreen ? styleFullscreen : style" v-bind="{ ...$props, ...$attrs }">
        <v-app-bar-title class="title">
            <AppLogo
                compact
                height="32px"
                max-height="32px"
                :disabled="unattendedMode"
                @click="onAppLogoClick"
                :clickOnly="appLogoGoHome"
                :showVersion="!noVersion"
                :version="version"
                v-bind="fwdBindProps('appLogoProps', $props)"
            />
        </v-app-bar-title>
        <div class="draggableRegion">
            <slot name="center">&nbsp;</slot>
        </div>

        <template v-slot:append>
            <slot name="prepend" :disabled="disabled" />
            <div v-if="$slots.prepend && !noPrependSpacer" class="mr-5"></div>

            <slot :disabled="disabled">
                <ShopButton
                    v-if="!unattendedMode && !noShopButton && !noButtons"
                    class="mr-5"
                    :disabled="disabled"
                    v-bind="fwdBindProps('shopButtonsProps', $props)"
                />
                <LightDarkButton
                    v-if="enableLightDarkButton && !noButtons"
                    maxWidth="150px"
                    rounded="xl"
                    class="mr-5"
                    :disabled="disabled"
                    v-bind="fwdBindProps('lightDarkButtonProps', $props)"
                />
                <LanguageButton
                    v-if="!noLanguageButton && !noButtons"
                    maxWidth="150px"
                    rounded="xl"
                    class="mr-5"
                    :disabled="disabled"
                    v-bind="fwdBindProps('languageButtonProps', $props)"
                />
                <UserButton
                    v-if="!unattendedMode && !noUserButton && !noButtons"
                    maxWidth="200px"
                    rounded="xl"
                    class="mr-5"
                    :service="userService"
                    :disabled="disabled"
                    v-bind="fwdBindProps('userButtonsProps', $props)"
                />
            </slot>

            <slot name="append" :disabled="disabled" />
            <div v-if="$slots.append && !noAppendSpacer" class="mr-5"></div>

            <WindowButtons
                v-if="!unattendedMode"
                dividerL
                @fullscreenChanged="onFullscreenChanged"
                :disabled="disabled"
                v-bind="fwdBindProps('windowButtonsProps', $props)"
            />
        </template>
    </v-app-bar>
</template>

<script setup>
import { ref, computed } from "vue";

import { vuetify } from "jsl/Vuetify";

import App from "jsl/App.vue";
import Main from "jsl/screens/Main.vue";

import { appConfig } from "jsl/AppConfig";

import { fwdProps, fwdBindProps } from "jsl/utils/ForwardVueProps";

import Link from "jsl/components/Link.vue";

import UserButton from "jsl/components/user/UserButton.vue";
import LanguageButton from "jsl/components/i18n/LanguageButton.vue";
import LightDarkButton from "jsl/components/LightDarkButton.vue";
import AppLogo from "jsl/components/AppLogo.vue";
import WindowButtons from "jsl/components/WindowButtons.vue";
import ShopButton from "jsl/components/ShopButton.vue";

import { computedBackgroundStyle, makeBackgroundStyleProps } from "jsl/utils/Style";

import { platform } from "jsl/Platform";
import { UserService } from "jsl/Backend";

import { app } from "jsl/App";

const props = defineProps({
    // Disables all buttons and the WindowButtons
    disabled: { type: Boolean, required: false, default: false },

    // A nice version text to show, or null if the AppConfig.version should be used.
    version: { type: String, default: null },

    // If true, the app logo does not call any website or href. Instead, "goHome" is emitted.
    appLogoGoHome: { type: Boolean, default: false },

    // elevate when scrolling
    scrollBehavior: { default: "elevate" },

    // Allows to explicitly disable the shop button in the append area
    noShopButton: { type: Boolean, default: false },
    // Allows to explicitly disable the language button in the append area
    noLanguageButton: { type: Boolean, default: false },
    // Allows to explicitly disable the user button in the append area
    noUserButton: { type: Boolean, default: false },
    // Or disable them all at once
    noButtons: { type: Boolean, default: false },
    // Disable version display
    noVersion: { type: Boolean, default: false },
    // The dark/light theme toggle button must be enabled explicitly
    enableLightDarkButton: { type: Boolean, default: false },

    // Spacing between the prepend slot and the default buttons?
    noPrependSpacer: { type: Boolean, default: false },
    // Spacing between the append slot and the window buttons/edge of the appbar?
    noAppendSpacer: { type: Boolean, default: false },

    // Background style color, blur, alpha, brightness
    // This also creates the prop "color" that is also used by v-app-bar.
    ...makeBackgroundStyleProps("", { color: "surface", alpha: 1.0, brightness: 1.0, blur: 20 }),
    // Background to use when the app goes fullscreen
    ...makeBackgroundStyleProps("fullscreen", { color: "surface", alpha: 0.0, brightness: 1.0, blur: 20 }),

    // The user service to utilize for user management
    userService: { type: UserService, required: false, default: null },

    // Properties to pass to the window buttons
    ...fwdProps("windowButtonsProps"),

    // Other props to forward to nested elements
    ...fwdProps("appLogoProps"),
    ...fwdProps("languageButtonProps"),
    ...fwdProps("lightDarkButtonProps"),
    ...fwdProps("userButtonProps"),
    ...fwdProps("shopButtonProps"),
});

const emit = defineEmits([
    // if the user requested to go back home. This can happen via buttons or the app logo
    "goHome",
]);

const style = computedBackgroundStyle(props, "");
const styleFullscreen = computedBackgroundStyle(props, "fullscreen");

const isFullscreen = ref(false);

const _version = computed(() => {
    return props.version || appConfig.version;
});

const unattendedMode = app.featureLocks.unattendedMode.locked;

function onFullscreenChanged(newState) {
    isFullscreen.value = newState;
}

function onAppLogoClick() {
    if (props.appLogoGoHome) {
        emit("goHome");
    }
}
</script>

<style scoped>
.draggableRegion {
    /* Makes the app bar the drag region in a deco-less window in electron */
    -webkit-app-region: drag;
    height: 100%;
    width: 100%;
    display: inline-block;

    align-content: center;
    text-align: center;
}

.title {
    /* Prevents the Title to shrink below its content size due to a big draggable region */
    min-width: fit-content;

    /* Prevent selection of text */
    user-select: none;
}

/*
.title >>> div {
    display: flex;
    align-items: flex-end;
}
*/
</style>
