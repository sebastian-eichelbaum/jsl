<template>
    <Multiplexer :selected="screen || initialScreen">
        <template #busy>
            <div align="center">
                <v-progress-circular :size="70" :width="5" color="primary" indeterminate></v-progress-circular>
            </div>
        </template>

        <template #login>
            <Login
                v-model="emailModel"
                @submit="onSubmit"
                @requestSignup="onRequestSignup"
                @requestRecover="onRequestRecover"
                v-bind="{ ...$props, ...$attrs }"
            />
        </template>
        <template #signup>
            <Signup
                v-model="emailModel"
                @submit="onSubmit"
                @requestLogin="onRequestLogin"
                @requestRecover="onRequestRecover"
                v-bind="{ ...$props, ...$attrs }"
            />
        </template>
        <template #recover>
            <Recover
                v-model="emailModel"
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
import { UserService } from "@jsl/Backend";

import Multiplexer from "@jsl/components/Multiplexer.vue";
import Login from "@jsl/components/user/forms/Login.vue";
import Signup from "@jsl/components/user/forms/Signup.vue";
import Recover from "@jsl/components/user/forms/ResetPassword.vue";

const screen = ref("");

const props = defineProps({
    // The initial screen. "login", "signup", "recover"
    initialScreen: { type: String, required: false, default: "login" },
    service: { type: UserService, required: true },
});

const emailModel = ref();

async function onSubmit(state) {
    if (props.service == null) {
        state.formErrorMsg({ key: "common.msg.unknownError", error: "service is null" });
    }

    state.formBusy(true);

    // Choose one of the ops
    const handle = async (state) => {
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
                await props.service.recover(state.values.email);
                break;
            default:
                throw new Error("Unknown auth type");
        }
    };

    await handle(state)
        .then(() => {
            state.formBusy(false);
            state.formReset();
        })
        .catch((error) => {
            state.formBusy(false, 500);
            console.error(error);
            state.formErrorMsg(error);
        });
}

function onRequestLogin() {
    screen.value = "login";
}

function onRequestSignup() {
    screen.value = "signup";
}

function onRequestRecover() {
    screen.value = "recover";
}
</script>