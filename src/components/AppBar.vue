<template>
    <v-app-bar app scroll-behavior="elevate" class="jsl-bgBlur-20 jsl-bgAlpha-surface-10">
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
</script>
