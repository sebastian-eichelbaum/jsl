<!--
An AppBar that provides some common functions

* Anonymous slot: set to override the whole right hand side of the app bar. By default, this contains the shop button,
language switcher and the user button.
* Slot "append": allows to add content to the right of the anonymous slot. Use this if the default should be kept but
extended.
-->
<template>
    <v-app-bar :style="isFullscreen ? styleFullscreen : style" v-bind="{ ...$props, ...$attrs }">
        <v-app-bar-title class="title">
            <AppLogo compact :nolink="unattendedMode" />
        </v-app-bar-title>
        <div class="draggableRegion">&nbsp;</div>

        <template v-slot:append>
            <slot>
                <ShopButton v-if="!unattendedMode && !noShopButton" :hideText="smAndDown" class="mr-5" />
                <LanguageButton
                    v-if="!noLanguageButton"
                    :hideText="smAndDown"
                    maxWidth="150px"
                    rounded="xl"
                    class="mr-5"
                />
                <UserButton
                    v-if="!unattendedMode && !noUserButton"
                    :hideText="smAndDown"
                    maxWidth="200px"
                    rounded="xl"
                    class="mr-5"
                />
            </slot>

            <slot name="append" />

            <WindowButtons v-if="!unattendedMode" dividerL @fullscreenChanged="onFullscreenChanged" />
        </template>
    </v-app-bar>
</template>

<script setup>
import { ref, computed } from "vue";

import { vuetify } from "@jsl/Vuetify";

import App from "@jsl/App.vue";
import Main from "@jsl/screens/Main.vue";

import authBackgroundImage from "@assets/auth_background.png";
import Link from "@jsl/components/Link.vue";

import UserButton from "@jsl/components/user/UserButton.vue";
import LanguageButton from "@jsl/components/i18n/LanguageButton.vue";
import AppLogo from "@jsl/components/AppLogo.vue";
import WindowButtons from "@jsl/components/WindowButtons.vue";
import ShopButton from "@jsl/components/ShopButton.vue";

import { computedBackgroundStyle, makeBackgroundStyleProps } from "@jsl/utils/Style";

import { platform } from "@jsl/Platform";

import { app } from "@jsl/App";

import { useDisplay } from "vuetify";

const props = defineProps({
    // elevate when scrolling
    scrollBehavior: { default: "elevate" },

    // Allows to explicitly disable the shop button in the append area
    noShopButton: { type: Boolean, default: false },
    // Allows to explicitly disable the language button in the append area
    noLanguageButton: { type: Boolean, default: false },
    // Allows to explicitly disable the user button in the append area
    noUserButton: { type: Boolean, default: false },

    // Background style color, blur, alpha, brightness
    // This also creates the prop "color" that is also used by v-app-bar.
    ...makeBackgroundStyleProps("", { color: "surface", alpha: 1.0, brightness: 1.0, blur: 20 }),
    // Background to use when the app goes fullscreen
    ...makeBackgroundStyleProps("fullscreen", { color: "surface", alpha: 0.0, brightness: 1.0, blur: 20 }),
});

const { smAndDown } = useDisplay();

const style = computedBackgroundStyle(props, "");
const styleFullscreen = computedBackgroundStyle(props, "fullscreen");

const isFullscreen = ref(false);

const unattendedMode = app.featureLocks.unattendedMode.locked;

function onFullscreenChanged(newState) {
    isFullscreen.value = newState;
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
