<!--
A specialization of jsl/components/forms/Authentication.vue geared towards LOGIN. This only sets some defaults.
-->

<template>
    <Authentication
        @submit="onSubmit"
        requireEmail
        requireName
        requireNewPassword
        offerLogin
        offerRecover
        v-bind="{ ...$props, ...$attrs }"
    >
    </Authentication>
</template>

<script setup>
import { ref } from "vue";

import Validators from "jsl/utils/Validators";
import { localization } from "jsl/Localization";

import Authentication from "jsl/components/user/forms/Authentication.vue";

const props = defineProps({
    // Title text. Hides the column if empty
    title: { type: String, required: false, default: "user.ui.signup" },
    // Prompt text. Hides the column if empty
    prompt: { type: String, required: false, default: "user.prompt.signup" },

    // Also: jsl/components/forms/Authentication.vue
});

const emit = defineEmits([
    // The user filled and submitted the form. The form state struct, as created in
    // jsl/components/forms/Form.vue is passed.
    "submit",

    // Also: jsl/components/forms/Authentication.vue
]);

function onSubmit(state) {
    state.type = "signup";
    emit("submit", state);
}
</script>
