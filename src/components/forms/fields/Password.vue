<template>
    <v-row no-gutters>
        <v-col cols="12">
            <v-text-field
                :label="localization.tt(label)"
                :rules="
                    requireNewPassword
                        ? [Validators.passwordScore(newPasswordScore, newPasswordLength)]
                        : [Validators.required()]
                "
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @click:append-inner="showPassword = !showPassword"
                :class="{ 'jsl-extendedMessages-3': requireNewPassword}"
                :name="name"
                v-model="password"
            />
        </v-col>
        <v-col cols="12" v-if="requireNewPassword">
            <v-text-field
                :label="localization.tt(confirmLabel)"
                :rules="[Validators.passwordMatch(password)]"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @click:append-inner="showPassword = !showPassword"
                name="passConfirm"
            />
        </v-col>
    </v-row>
</template>

<script setup>
import { ref } from "vue";

import Validators from "@jsl/utils/Validators";
import { localization } from "@jsl/Localization";

const props = defineProps({
    // The label of the field
    label: { type: String, required: false, default: "form.ui.password" },
    // The label of the password confirm field
    confirmLabel: { type: String, required: false, default: "form.ui.confirmPassword" },

    // The name to use to identify the value
    name: { type: String, required: false, default: "password" },

    // Minimum score to accept the password. If 0, all non-empty strings are accepted that at least match newPasswordLength.
    newPasswordScore: { required: false, default: 1 },
    // Minimum length to accept for new passwords. 0 is ignored.
    newPasswordLength: { required: false, default: 8 },

    // If set, the password field also adds a confirmation field and applies the newPasswordScore score.
    // It validates if both fields match and are at least as safe as the score requires.
    requireNewPassword: { type: Boolean, required: false, default: false },
});

// Show/hide pass
const showPassword = ref(false);
// The password field value
const password = ref("");
</script>
