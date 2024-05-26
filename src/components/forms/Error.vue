<!--
Provides a simple error message box to be used in forms
-->

<template>
    <Alert v-bind="{ ...$props, ...$attrs }" />
</template>

<script setup>
import { localization, Translatable, tt } from "jsl/Localization";

import Alert from "jsl/components/Alert.vue";

const props = defineProps({
   // v-alert type: error, info, success, warning, or null (plain)
    type: { type: String, required: false, default: "error" },

    // And the Alert props
});
</script>
