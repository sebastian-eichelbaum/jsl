<template>
    <Form
        :title="title"
        :prompt="prompt"
        v-bind="{ ...$props, ...$attrs }"
        asRow
        :row="{ noGutters: true }"
        v-model="model"
        @submit="onSubmit"
    >
        <template v-slot="{ busy, model }">
            <v-col cols="12">
                <Password
                    v-model="model.password"
                    name="password"
                    :label="passwordLabel"
                    :confirmLabel="passwordConfirmLabel"
                    requireOldPassword
                    requireNewPassword
                    :newPasswordScore="newPasswordScore"
                    :newPasswordLength="newPasswordLength"
                />
            </v-col>
        </template>
    </Form>
</template>

<script setup>
import { ref } from "vue";

import Validators from "@jsl/utils/Validators";
import { localization } from "@jsl/Localization";
import { UserService } from "@jsl/Backend";

import Form from "@jsl/components/forms/Form.vue";
import SubmitButton from "@jsl/components/forms/SubmitButton.vue";

import Email from "@jsl/components/forms/fields/Email.vue";
import Name from "@jsl/components/forms/fields/Name.vue";
import Company from "@jsl/components/forms/fields/Company.vue";
import Password from "@jsl/components/forms/fields/Password.vue";

const props = defineProps({
    // Title text. Hides the column if empty
    title: { type: String, required: false, default: "user.ui.updatePassword" },
    // Prompt text. Hides the column if empty
    prompt: { type: String, required: false, default: "user.prompt.updatePassword" },

    // Label of the password field
    passwordLabel: { type: String, required: false, default: "form.ui.password" },
    passwordOldLabel: { type: String, required: false, default: "form.ui.passwordCurrent" },
    // Label of the password confirm field
    passwordConfirmLabel: { type: String, required: false, default: "form.ui.confirmPassword" },

    // Icon to use for the default submit button
    submitIcon: { type: String, required: false, default: "mdi-check" },
    // Button color to use for the default submit button
    submitColor: { type: String, required: false, default: "primary" },
    // Button text for the default submit button.
    submitText: { type: String, required: false, default: null },

    // Password.vue: Minimum score to accept the password. If 0, all non-empty strings are accepted that at least match
    // newPasswordLength.
    newPasswordScore: { required: false, default: 1 },
    // Password.vue: Minimum length to accept for new passwords. 0 is ignored.
    newPasswordLength: { required: false, default: 8 },

    // The user service to utilize
    service: { type: UserService, required: true },

    // ALSO: props by @jsl/components/forms/Form.vue
});

const model = ref();
async function onSubmit(state) {
    await state.action(async (state) => {
        if (props.service == null) {
            throw new Error("Service is null");
        }

        return props.service.updatePassword(state.values.passOld, state.values.password);
    });
}
</script>
