<template>
    <Window v-bind="{ ...$props, ...$attrs }" :greetText="tt(greetText, { user: tt(userName()) })">
        <v-card-item class="pt-5 pb-5">
            {{ tt("common.msg.sid") }}
        </v-card-item>
        <v-card-actions>
            <v-spacer />

            <LogoutButton size="large" :slim="false" :rounded="roundedButtons" :text="logoutText" />
        </v-card-actions>
    </Window>
</template>

<script setup>
import { computed } from "vue";

import { tt } from "@jsl/Localization";

import Window from "@jsl/components/dialogs/Window.vue";
import Button from "@jsl/components/Button.vue";
import LogoutButton from "@jsl/components/user/LogoutButton.vue";

import { userName } from "@jsl/utils/Backend";

const props = defineProps({
    // Dialog max width.
    maxWidth: { default: 500 },

    // Titlebar
    icon: { default: "mdi-account-cog" },
    title: { default: tt("common.ui.settings") },

    // The greet and message area below the titlebar
    greetText: { default: tt("common.msg.greet") },
    greetSubtext: { default: tt("common.msg.settingsAndProfileExplanation") },

    // Roundedness of the buttons
    roundedButtons: { type: String, default: "regular" },

    // Button texts
    logoutText: { default: tt("user.ui.logout") },

    // ... and the Window props.
});
</script>
