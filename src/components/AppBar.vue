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
            <AppLogo compact :disabled="unattendedMode" @click="onAppLogoClick" :clickOnly="appLogoGoHome" />
            <span
                v-if="version && !noVersion"
                class="text-caption font-weight-light"
                style="color: rgba(255, 255, 255, 0.3)"
                >{{ version }}</span
            >
        </v-app-bar-title>
        <div class="draggableRegion">&nbsp;</div>

        <template v-slot:append>
            <slot :disabled="disabled">
                <ShopButton v-if="!unattendedMode && !noShopButton && !noButtons" class="mr-5" :disabled="disabled" />
                <LanguageButton
                    v-if="!noLanguageButton && !noButtons"
                    maxWidth="150px"
                    rounded="xl"
                    class="mr-5"
                    :disabled="disabled"
                />
                <UserButton
                    v-if="!unattendedMode && !noUserButton && !noButtons"
                    maxWidth="200px"
                    rounded="xl"
                    class="mr-5"
                    :service="userService"
                    :disabled="disabled"
                />
            </slot>

            <slot name="append" :disabled="disabled" />

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

import { vuetify } from "@jsl/Vuetify";

import App from "@jsl/App.vue";
import Main from "@jsl/screens/Main.vue";

import { fwdProps, fwdBindProps } from "@jsl/utils/ForwardVueProps";

import authBackgroundImage from "@assets/auth_background.png";
import Link from "@jsl/components/Link.vue";

import UserButton from "@jsl/components/user/UserButton.vue";
import LanguageButton from "@jsl/components/i18n/LanguageButton.vue";
import AppLogo from "@jsl/components/AppLogo.vue";
import WindowButtons from "@jsl/components/WindowButtons.vue";
import ShopButton from "@jsl/components/ShopButton.vue";

import { computedBackgroundStyle, makeBackgroundStyleProps } from "@jsl/utils/Style";

import { platform } from "@jsl/Platform";
import { UserService } from "@jsl/Backend";

import { app } from "@jsl/App";

const props = defineProps({
    // Disables all buttons and the WindowButtons
    disabled: { type: Boolean, required: false, default: false },

    // A nice version text to show, or null
    version: { type: String, default: __APP_VERSION__ },

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

    // Background style color, blur, alpha, brightness
    // This also creates the prop "color" that is also used by v-app-bar.
    ...makeBackgroundStyleProps("", { color: "surface", alpha: 1.0, brightness: 1.0, blur: 20 }),
    // Background to use when the app goes fullscreen
    ...makeBackgroundStyleProps("fullscreen", { color: "surface", alpha: 0.0, brightness: 1.0, blur: 20 }),

    // The user service to utilize for user management
    userService: { type: UserService, required: false, default: null },

    // Properties to pass to the window buttons
    ...fwdProps("windowButtonsProps"),
});

const emit = defineEmits([
    // if the user requested to go back home. This can happen via buttons or the app logo
    "goHome",
]);

const style = computedBackgroundStyle(props, "");
const styleFullscreen = computedBackgroundStyle(props, "fullscreen");

const isFullscreen = ref(false);

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
}

.title {
    /* Prevents the Title to shrink below its content size due to a big draggable region */
    min-width: fit-content;

    /* Prevent selection of text */
    user-select: none;
}
</style>
