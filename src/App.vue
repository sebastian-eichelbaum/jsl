<!-- 
A common App skeleton that provides a authorization screen and a main screen.

This can be seen as an inspiration and tutorial on how to setup an app.

* The anonymous slot defines the main screen content.
-->

<template>
    <v-app id="app">
        <v-main>
            <Multiplexer :selected="screen">
                <template #auth>
                    <AppCloseButton />
                    <BigPanel :background="fwd_authBackground">
                        <Authentfication :service="backend.user" titleAlign="center" />
                    </BigPanel>
                </template>
                <template #main>
                    <slot>TODO: fill in some contents</slot>
                </template>
            </Multiplexer>
        </v-main>
    </v-app>

    <InitOverlay delay="200" />
    <ScrollbarStyle :color="vuetify.themeColors.primary" />
</template>

<script setup>
import { ref, computed } from "vue";

import { vuetify } from "@jsl/Vuetify";

import { fwdProps } from "@jsl/utils/ForwardVueProps";

import InitOverlay from "@jsl/utils/InitOverlay.vue";
import ScrollbarStyle from "@jsl/utils/ScrollbarStyle.vue";

import BigPanel from "@jsl/screens/BigPanel.vue";
import AppCloseButton from "@jsl/components/AppCloseButton.vue";
import Multiplexer from "@jsl/components/Multiplexer.vue";

import Authentfication from "@jsl/views/Authentication.vue";

import { backend } from "@jsl/Backend";

const screen = computed(() => {
    if (backend.user) {
        return backend.user.user?.isLoggedIn ? "main" : "auth";
    }

    return "main";
});

const props = defineProps({
    // Forward all those nested component props
    ...fwdProps("authBackground", {}),
});
</script>
