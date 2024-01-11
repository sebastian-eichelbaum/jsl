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
                @requestPasswordReset="onRequestPasswordReset"
                v-bind="{ ...$props, ...$attrs }"
            />
        </template>
        <template #signup>
            <Signup
                v-model="emailModel"
                @submit="onSubmit"
                @requestLogin="onRequestLogin"
                @requestPasswordReset="onRequestPasswordReset"
                v-bind="{ ...$props, ...$attrs }"
            />
        </template>
        <template #resetPassword>
            <ResetPassword
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

import Multiplexer from "@jsl/components/Multiplexer.vue";
import Login from "@jsl/components/forms/Login.vue";
import Signup from "@jsl/components/forms/Signup.vue";
import ResetPassword from "@jsl/components/forms/ResetPassword.vue";

const screen = ref("");

const props = defineProps({
    // The initial screen. "login", "signup", "resetPassword"
    initialScreen: { type: String, required: false, default: "login" },
});

const emailModel = ref();

function onSubmit(state) {
    console.log(state);

    //state.formEnabled(false);
    state.formBusy(true);
    
    setTimeout(()=>{state.formErrorMsg("wurst");}, 2000);
    setTimeout(()=>{state.formBusy(false);}, 2200);
    //screen.value = "busy";
}

function onRequestLogin() {
    screen.value = "login";
}

function onRequestSignup() {
    screen.value = "signup";
}

function onRequestPasswordReset() {
    screen.value = "resetPassword";
}
</script>
