<template>
    <v-app-bar :style="style" v-bind="{ ...$props, ...$attrs }">
        <v-app-bar-title>
            <AppLogo text oneline />
        </v-app-bar-title>

        <template v-slot:append>
            <ShopButton class="mr-5" />
            <LanguageButton maxWidth="150px" rounded="xl" class="mr-5" />
            <UserButton maxWidth="150px" rounded="xl" class="mr-5" />

            <AppCloseButton nofloat dividerL />
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
import AppCloseButton from "@jsl/components/AppCloseButton.vue";
import ShopButton from "@jsl/components/ShopButton.vue";

import { makeBackgroundStyle, computedBackgroundStyle, makeBackgroundStyleProps } from "@jsl/utils/Style";

const props = defineProps({
    // elevate when scrolling
    scrollBehavior: { default: "elevate" },

    // Background style color, blur, alpha, brightness
    // This also creates the prop "color" that is also used by v-app-bar.
    ...makeBackgroundStyleProps("", { color: "surface", alpha: 1.0, brightness: 1.0, blur: 20 }),
});

const style = computedBackgroundStyle(props, "");
</script>
