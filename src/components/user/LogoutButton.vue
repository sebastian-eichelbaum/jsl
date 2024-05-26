<template>
    <Button @click="ask" v-bind="{ ...$props, ...$attrs }"> </Button>

    <ConfirmDialog :contained="contained" v-model="dialog" variant__="evenly" @yes="logout" :title="title" :subtitle="subtitle" />
</template>

<script setup>
import { computed, ref } from "vue";
import { tt, Translatable } from "jsl/Localization";

import Button from "jsl/components/Button.vue";

import ConfirmDialog from "jsl/components/dialogs/ConfirmDialog.vue";

import { userName } from "jsl/utils/Backend";

import { backend } from "jsl/Backend";

const props = defineProps({
    icon: { type: String, required: false, default: "mdi-logout" },
    color: { default: "error" },

    // Should the config dialog be contained in its parent?
    contained: { type: Boolean, required: false, default: false },

    // + Props from jsl/components/Button.vue

    title: { type: [String, Translatable], default: tt("common.prompt.areYouSure") },
    subtitle: { type: [String, Translatable], default: tt("user.prompt.areYouSureToLogout") },
});

let dialog = ref(false);

const ask = () => {
    dialog.value = true;
};

const logout = () => {
    backend.user?.logout();
};
</script>
