<template>
    <Multiplexer :selected="screen || initialScreen">
        <template #busy>
            <div align="center">
                <v-progress-circular :size="70" :width="5" color="primary" indeterminate></v-progress-circular>
            </div>
        </template>

        <template #login>
            <v-slide-x-transition>
                <FormMsg
                    :type="null"
                    icon="mdi-email"
                    :message="tt('user.msg.recoverMailSent')"
                    v-if="showRecoverySent"
                />
            </v-slide-x-transition>
            <Login
                v-model="model"
                @submit="onSubmit"
                @requestSignup="onRequestSignup"
                @requestRecover="onRequestRecover"
                v-bind="{ ...$props, ...$attrs }"
            />
        </template>
        <template #signup>
            <Signup
                v-model="model"
                @submit="onSubmit"
                @requestLogin="onRequestLogin"
                @requestRecover="onRequestRecover"
                v-bind="{ ...$props, ...$attrs }"
            />
        </template>
        <template #recover>
            <Recover
                v-model="model"
                @submit="onSubmit"
                @requestLogin="onRequestLogin"
                @requestSignup="onRequestSignup"
                v-bind="{ ...$props, ...$attrs }"
            />
        </template>
    </Multiplexer>
</template>

<script setup>
import { ref, computed } from "vue";

import { UserService } from "jsl/Backend";
import { tt, Translatable } from "jsl/Localization";

import Multiplexer from "jsl/components/Multiplexer.vue";
import Login from "jsl/components/user/forms/Login.vue";
import Signup from "jsl/components/user/forms/Signup.vue";
import Recover from "jsl/components/user/forms/ResetPassword.vue";
import FormMsg from "jsl/components/forms/Error.vue";

const screen = ref("");

const props = defineProps({
    // The initial screen. "login", "signup", "recover"
    initialScreen: { type: String, required: false, default: "login" },

    // The user service to utilize
    service: { type: UserService, required: true },
});

const model = ref();
const showRecoverySent = ref(false);

async function onSubmit(state) {
    showRecoverySent.value = false;
    await state.action(async (state) => {
        if (props.service == null) {
            throw new Error("Service is null");
        }

        switch (state.type) {
            case "login":
                await props.service.login(state.values.email, state.values.password);
                break;
            case "signup":
                await props.service.signup(state.values.email, state.values.password, state.values.name, {
                    // Optional
                    // company: state.values.company,
                });
                break;
            case "recover":
                await props.service.recover(state.values.email).then(() => {
                    showRecoverySent.value = true;
                    screen.value = "login";
                });
                break;
            default:
                throw new Error("Unknown auth type");
        }
    });
}

function onRequestLogin() {
    showRecoverySent.value = false;
    screen.value = "login";
}

function onRequestSignup() {
    screen.value = "signup";
}

function onRequestRecover() {
    screen.value = "recover";
}
</script>
