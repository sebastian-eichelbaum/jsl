<template>
    <Button v-bind="{ ...$props, ...$attrs }" :text="userName()">
        <UserDialog v-model="dialog" activator="parent" />
    </Button>
</template>

<script setup>
import { computed, ref } from "vue";

import Button from "@jsl/components/Button.vue";

import UserDialog from "@jsl/components/user/UserDialog.vue";

import { userName } from "@jsl/utils/Backend";

const dialog = ref(false);

const props = defineProps({
    icon: { type: String, required: false, default: "mdi-account" },

    // + Props from jsl/components/Button.vue
});
</script>
