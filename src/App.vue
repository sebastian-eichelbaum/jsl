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
                    <WindowButtons float />
                    <BigPanel :background="authBackground">
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
    <ScrollbarStyle />

    <QuitDialog v-bind="fwdBindProps('quitDialogProps', $props)" handleWindowClose />
</template>

<script setup>
import { ref, computed } from "vue";

import { vuetify } from "jsl/Vuetify";

import { fwdProps, fwdBindProps } from "jsl/utils/ForwardVueProps";

import InitOverlay from "jsl/utils/InitOverlay.vue";
import ScrollbarStyle from "jsl/utils/ScrollbarStyle.vue";

import QuitDialog from "jsl/components/dialogs/QuitDialog.vue";

import BigPanel from "jsl/screens/BigPanel.vue";
import WindowButtons from "jsl/components/WindowButtons.vue";
import Multiplexer from "jsl/components/Multiplexer.vue";

import Authentfication from "jsl/views/Authentication.vue";

import { UserService, backend } from "jsl/Backend";

const props = defineProps({
    // The user service to utilize
    userService: { type: UserService, default: null },

    // Forward some BigPanel/Background component props. (As Background Style props as in Style.js)
    ...fwdProps("authBackground"),
    // Quit dialog props, especially the title and subtitle props might be interesting
    ...fwdProps("quitDialogProps"),
});

const userBackend = props.userService || backend?.user;
const screen = computed(() => {
    if (userBackend) {
        return userBackend.user?.isLoggedIn ? "main" : "auth";
    }

    return "main";
});
</script>
