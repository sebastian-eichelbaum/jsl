<!--
A generic auth form template that provides the UI elements (and their customization points) needed to authorize a user,
sign up a user or reset their password.

This is only a view. It does not provide any control logic. Subscribe to the emitted events and act accordingly.

The unnamed slot can be used to customize the submit button.
-->

<template>
    <Form :title="title" :prompt="prompt" v-bind="{ ...$props, ...$attrs }">
        <template v-slot="{ busy }">
            <v-row :no-gutters="!larger">
                <v-col cols="12" :class="{ 'mb-2': !larger }" v-if="requireName">
                    <Name :label="nameLabel" />
                </v-col>
                <v-col cols="12" :class="{ 'mb-2': !larger }" v-if="requireCompany">
                    <Company optional :label="companyLabel" />
                </v-col>
                <v-col cols="12" :class="{ 'mb-2': !larger }" v-if="requireEmail">
                    <Email v-model="emailModel" :label="emailLabel" />
                </v-col>
                <v-col cols="12" :class="{ 'mb-0': !larger }" v-if="requirePassword || requireNewPassword">
                    <Password
                        :label="passwordLabel"
                        :confirmLabel="passwordConfirmLabel"
                        :requireNewPassword="requireNewPassword"
                        :newPasswordScore="newPasswordScore"
                        :newPasswordLength="newPasswordLength"
                    />
                </v-col>
                <v-col class="text-left" align="center" align-self="center" cols="9" :class="{ 'mt-3': !larger }">
                    <v-row no-gutters>
                        <v-col cols="12" v-if="offerLogin">
                            <v-btn
                                @click="onLoginRequest"
                                variant="text"
                                rounded="xl"
                                size="small"
                                prepend-icon="mdi-account"
                                :disabled="busy"
                            >
                                {{ localization.tt(offerLoginLabel) }}
                            </v-btn>
                        </v-col>

                        <v-col cols="12" v-if="offerSignup">
                            <v-btn
                                @click="onSignupRequest"
                                variant="text"
                                rounded="xl"
                                size="small"
                                prepend-icon="mdi-account-plus"
                                :disabled="busy"
                            >
                                {{ localization.tt(offerSignupLabel) }}
                            </v-btn>
                        </v-col>

                        <v-col cols="12" v-if="offerRecover">
                            <v-btn
                                @click="onRecoverRequest"
                                variant="text"
                                rounded="xl"
                                size="small"
                                prepend-icon="mdi-account-question"
                                :disabled="busy"
                            >
                                {{ localization.tt(offerRecoverLabel) }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col class="text-right" align="center" align-self="center" cols="3" :class="{ 'mt-3': !larger }">
                    <slot>
                        <SubmitButton
                            :loading="busy"
                            :text="submitText"
                            :color="submitColor"
                            :icon="submitIcon"
                    /></slot>
                </v-col>
            </v-row>
        </template>
    </Form>
</template>

<script setup>
import { ref } from "vue";

import Validators from "@jsl/utils/Validators";
import { localization } from "@jsl/Localization";

import Form from "@jsl/components/forms/Form.vue";
import SubmitButton from "@jsl/components/forms/SubmitButton.vue";

import Email from "@jsl/components/forms/fields/Email.vue";
import Name from "@jsl/components/forms/fields/Name.vue";
import Company from "@jsl/components/forms/fields/Company.vue";
import Password from "@jsl/components/forms/fields/Password.vue";

const props = defineProps({
    // Title text. Hides the column if empty
    title: { type: String, required: false, default: "user.ui.login" },
    // Prompt text. Hides the column if empty
    prompt: { type: String, required: false, default: "user.prompt.login" },

    // Label of the e-mail field
    emailLabel: { type: String, required: false, default: "form.ui.email" },
    // Label of the name field
    nameLabel: { type: String, required: false, default: "form.ui.name" },
    // Label of the company field
    companyLabel: { type: String, required: false, default: "form.ui.company" },
    // Label of the password field
    passwordLabel: { type: String, required: false, default: "form.ui.password" },
    // Label of the password confirm field
    passwordConfirmLabel: { type: String, required: false, default: "form.ui.confirmPassword" },

    // Icon to use for the default submit button
    submitIcon: { type: String, required: false, default: "mdi-arrow-right-thin" },
    // Button color to use for the default submit button
    submitColor: { type: String, required: false, default: "primary" },
    // Button text for the default submit button.
    submitText: { type: String, required: false, default: null },

    // Require a password field?
    requirePassword: { type: Boolean, required: false, default: false },
    // Require an email field?
    requireEmail: { type: Boolean, required: false, default: true },
    // Require a new, safe and confirmed password field?
    requireNewPassword: { type: Boolean, required: false, default: false },
    // Require a name
    requireName: { type: Boolean, required: false, default: false },
    // Require a company (note: the company is visible but optional if this is set)
    requireCompany: { type: Boolean, required: false, default: false },

    // If set, the signup button is shown
    offerSignup: { type: Boolean, required: false, default: false },
    // If set, the password reset button is shown
    offerRecover: { type: Boolean, required: false, default: false },
    // If set, the login button is show
    offerLogin: { type: Boolean, required: false, default: false },

    // Label of the "forgot password" request button
    offerRecoverLabel: { type: String, required: false, default: "user.ui.passwordResetLink" },
    // Label of the "register" request button
    offerSignupLabel: { type: String, required: false, default: "user.ui.signup" },
    // Label of the "login" request button
    offerLoginLabel: { type: String, required: false, default: "user.ui.login" },

    // The form is as compact as possible. To extend to the default row gutter, set this to true
    larger: { type: Boolean, required: false, default: false },

    // Password.vue: Minimum score to accept the password. If 0, all non-empty strings are accepted that at least match
    // newPasswordLength.
    newPasswordScore: { required: false, default: 1 },
    // Password.vue: Minimum length to accept for new passwords. 0 is ignored.
    newPasswordLength: { required: false, default: 8 },

    // ALSO: props by @jsl/components/forms/Form.vue
});

const emit = defineEmits([
    // Once the user requests to sign up instead of sign in
    "requestSignup",
    // Once the user requests to recover their password
    "requestRecover",
    // Once the user wants to login instead
    "requestLogin",

    // ALSO: emits by @jsl/components/forms/Form.vue
]);

// Email value. Use this to sync email between multiple forms
const emailModel = defineModel();

function onRecoverRequest() {
    emit("requestRecover");
}

function onLoginRequest() {
    emit("requestLogin");
}

function onSignupRequest() {
    emit("requestSignup");
}
</script>
