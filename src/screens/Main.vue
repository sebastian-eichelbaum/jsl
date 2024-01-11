<template>
    <v-app-bar scroll-behavior="elevate" class="jsl-bgBlur-20 jsl-bgAlpha-10">
        <v-app-bar-title>
            <AppLogo text oneline />
        </v-app-bar-title>

        <template v-slot:append>
            <ShopButton class="mr-5" />
            <LanguageSwitch rounded class="mr-5" />
            <v-btn variant="tonal" rounded prepend-icon="mdi-account" class="mr-5">
                <span style="max-width: 100px" class="text-truncate">Max Mustermann</span>
            </v-btn>

            <v-divider :thickness="1" class="border-opacity-10 mr-3" color="#aaaaaa88" vertical></v-divider>
            <AppCloseButton nofloat />
        </template>
    </v-app-bar>

    <Background :image="background" blur="50px" alpha="0.1">
        <v-container class="fill-height">
            <v-row justify="start" class="mt-10 mb-10">
                <v-col
                    cols="12"
                    xs="12"
                    sm="12"
                    md="6"
                    lg="4"
                    xl="3"
                    xxl="2"
                    align="center"
                    align-self="center"
                    v-for="n in 24"
                    :key="n"
                >
                    <v-card height="375" width="375" class="blurredBackground-20"></v-card>
                </v-col>
            </v-row>
        </v-container>
    </Background>
</template>

<script setup>
import { ref, reactive } from "vue";

import Link from "@jsl/components/Link.vue";
import LanguageSwitch from "@jsl/components/i18n/LanguageSwitch.vue";
import AppLogo from "@jsl/components/AppLogo.vue";
import AppCloseButton from "@jsl/components/AppCloseButton.vue";
import ShopButton from "@jsl/components/ShopButton.vue";

import DefaultBackground from "@jslassets/DefaultBackground.webp";
import Background from "@jsl/components/Background.vue";

const props = defineProps({
    background: { type: String, required: false, default: DefaultBackground },
});
</script>

<style scoped>
#wrapper {
    width: 100%;
    height: 100%;
    position: relative;
}

/* Authentication background image */
#background {
    width: 100%;
    height: 100%;

    background-image: url(@assets/auth_background.png);
    background-color: transparent;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
}

#content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
}
</style>
