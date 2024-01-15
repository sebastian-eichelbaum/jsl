<template>
    <Button @click="ask" v-bind="{ ...$props, ...$attrs }"> </Button>

    <ConfirmDialog contained v-model="dialog" variant="evenly" @yes="logout" >
        <slot>{{ $t("user.prompt.areYouSureToLogout") }}</slot>
    </ConfirmDialog>

</template>

<script setup>
import { computed, ref } from "vue";

import Button from "@jsl/components/Button.vue";

import ConfirmDialog from "@jsl/components/dialogs/ConfirmDialog.vue";

import { userName } from "@jsl/utils/Backend";

import { backend } from "@jsl/Backend";

const props = defineProps({
    icon: { type: String, required: false, default: "mdi-logout" },
    color: { default: "error" },

    // + Props from jsl/components/Button.vue
});

let dialog = ref(false);

const ask = () => {
    dialog.value = true;
};

const logout = () => {
    backend.user?.logout();
};

</script>
