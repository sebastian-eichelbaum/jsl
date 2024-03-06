<template>
    <v-slide-x-transition>
        <Alert
            v-if="!service.user.isEmailVerified && !verificationSent"
            icon="mdi-email-alert-outline"
            color="grey-lighten-2"
            v-bind="{ ...$props, ...$attrs }"
            :message="text"
        >
            <br />
            <Button
                :disabled="disabled || verificationSent"
                :loading="busy"
                rounded="xl"
                variant="outlined"
                :slim="false"
                :text="resendText"
                class="mt-3 mb-2"
                justify="end"
                @click="sendVerificationMail"
            />
        </Alert>
    </v-slide-x-transition>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

import Validators from "@jsl/utils/Validators";
import { tt, Translatable } from "@jsl/Localization";

import { UserService } from "@jsl/Backend";

import Button from "@jsl/components/Button.vue";

import Alert from "@jsl/components/Alert.vue";

const props = defineProps({
    // The message to show
    text: { type: [String, Translatable], required: false, default: "user.msg.emailNotVerified" },
    resendText: { default: tt("user.ui.resend") },

    // Disable sending
    disabled: { type: Boolean, default: false },

    // The user service to utilize
    service: { type: UserService, required: true },

    // And the Alert props
});

const verificationSent = ref(false);
const busy = ref(false);

async function sendVerificationMail() {
    if (props.service == null) {
        throw new Error("Service is null");
    }

    busy.value = true;
    verificationSent.value = false;
    await props.service
        .sendVerificationMail()
        .then(() => {
            busy.value = false;
            verificationSent.value = true;
        })
        .catch((e) => {
            busy.value = false;
            verificationSent.value = true;
        });
}
</script>
