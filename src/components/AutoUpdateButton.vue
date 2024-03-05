<!--
Provides a button that opens the shop iff appConfig.urls.shop is not nullish.
-->
<template>
    <Button v-if="canUpdate" :hideText="smAndDown" v-bind="{ ...$props, ...$attrs }" @click="askUpdateNow">
        <ConfirmDialog
            v-model="dialog"
            :yes="restartText"
            :no="laterText"
            @yes="updateNow"
            :title="bannerTitle"
            :subtitle="bannerMessage"
            persistent
        />
    </Button>
</template>

<script setup>
import { useDisplay } from "vuetify";
import { ref } from "vue";

import Button from "@jsl/components/Button.vue";
import ConfirmDialog from "@jsl/components/dialogs/ConfirmDialog.vue";

import { platform } from "@jsl/Platform";
import { tt, Translatable } from "@jsl/Localization";
import { appConfig } from "@jsl/AppConfig";

import { AutoUpdater } from "@jsl/platforms/electron/AutoUpdater";

const props = defineProps({
    text: { default: tt("common.ui.update") },
    rounded: { default: "xl" },
    icon: { default: "mdi-download" },
    color: { default: "primary" },
    variant: { default: "flat" },
    maxWidth: { default: null },

    bannerTitle: { type: [String, Translatable], default: tt("common.msg.updateReadyToInstall") },
    bannerMessage: { type: [String, Translatable], default: tt("common.prompt.updateReadyToInstall") },

    laterText: { type: String, required: false, default: "common.ui.later" },
    restartText: { type: String, required: false, default: "common.ui.restartNow" },

    // And the Button props
});

const { smAndDown } = useDisplay();
const canUpdate = ref(false);
const dialog = ref(false);

const autoUpdater = new AutoUpdater({
    onUpdateReady: () => {
        canUpdate.value = true;
        dialog.value = true;
    },
});

const askUpdateNow = () => {
    dialog.value = true;
};

const updateNow = () => {
    // Do not ask again!
    platform.forceClose = true;
    autoUpdater.installAndRestart();
};
</script>

<style scoped></style>
