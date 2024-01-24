<!--
Provides a simple error message box to be used in forms
-->

<template>
    <v-scale-transition>
        <v-row no-gutters class="mb-7" v-if="message">
            <v-col cols="12">
                <v-alert type="error" :text="localization.tt(message)" v-bind="{ ...$props, ...$attrs }"></v-alert>
            </v-col>
        </v-row>
    </v-scale-transition>
</template>

<script setup>
import { localization, Translatable, tt } from "@jsl/Localization";

const props = defineProps({
    // v-alert variant for the error msg
    variant: { type: String, required: false, default: "tonal" },
    // v-alert density for the error msg
    density: { type: String, required: false, default: "compact" },
    // v-alert prominent for the error msg. Use this to make it NOT prominent
    prominent: { type: Boolean, required: false, default: true },
    // v-alert border for the error msg. Set to false to disable
    border: { required: false, default: "start" },

    // The message to display. If null, the alert hides itself.
    message: { type: [String, Translatable], required: false, default: null },
});
</script>
