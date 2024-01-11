<!--
A specialization of @jsl/components/forms/Authentication.vue geared towards LOGIN. This only sets some defaults.
-->

<template>
    <Authentication
        @submit="onSubmit"
        @invalid="onInvalid"
        requireEmail
        requireName
        requireCompany
        requireNewPassword
        offerLogin
        offerPasswordReset
        v-bind="{ ...$props, ...$attrs }"
    >
    </Authentication>
</template>

<script setup>
import { ref } from "vue";

import Validators from "@jsl/utils/Validators";
import { localization } from "@jsl/Localization";

import Authentication from "@jsl/components/forms/Authentication.vue";

const props = defineProps({
    // Title text. Hides the column if empty
    title: { type: String, required: false, default: "user.ui.signup" },
    // Prompt text. Hides the column if empty
    prompt: { type: String, required: false, default: "user.prompt.signup" },

    // Also: @jsl/components/forms/Authentication.vue
});

const emit = defineEmits([
    // The user filled and submitted the form. The form state struct, as created in
    // @jsl/components/forms/Form.vue is passed.
    "submit",
    // Triggered if the user submitted an invalid form. The form state struct, as created in
    // @jsl/components/forms/Form.vue is passed.
    "invalid",

    // Also: @jsl/components/forms/Authentication.vue
]);

function onInvalid(state) {
    emit("invalid", { type: "signup", ...state });
}

function onSubmit(state) {
    emit("submit", { type: "signup", ...state });
}
</script>
