<template>
    <Window v-bind="{ ...$props, ...$attrs }" @close="onClose">
        <v-card-item class="pt-5 pb-5">
            <div class="mb-5">{{ tt(pinText) }}</div>
            <Form title="" asRow @submit="onSubmit" noSubmit ref="formRef">
                <template v-slot="{ busy, model }">
                    <v-col cols="12">
                        <PIN v-model="model.pin" name="pin" submitEnable submitColor="primary" />
                    </v-col>
                </template>
            </Form>
        </v-card-item>
    </Window>
</template>

<script setup>
import { computed, ref } from "vue";

import { tt } from "@jsl/Localization";

import Form from "@jsl/components/forms/Form.vue";
import Window from "@jsl/components/dialogs/Window.vue";
import PIN from "@jsl/components/forms/fields/PIN.vue";
import Button from "@jsl/components/Button.vue";
import LogoutButton from "@jsl/components/user/LogoutButton.vue";

import { userName } from "@jsl/utils/Backend";

const props = defineProps({
    // Dialog max width.
    maxWidth: { default: 500 },

    // Titlebar
    icon: { default: "mdi-lock" },
    title: { default: tt("common.ui.lock") },

    // The greet and message area below the titlebar
    greetText: { default: tt("common.msg.todo", { what: "greetText or noGreetBox!" }) },
    greetSubtext: { default: tt("common.msg.todo", { what: "greetSubtext or noGreetBox!" }) },

    // The text to show above the pin entry
    pinText: { default: tt("common.msg.todo", { what: "pinText!" }) },

    // Roundedness of the buttons
    roundedPinButtons: { type: String, default: "regular" },
    roundedButtons: { type: String, default: "regular" },

    // Button texts
    logoutText: { default: tt("user.ui.logout") },

    minPinLength: { type: Number, default: 4 },
    maxPinLength: { type: Number, default: 16 },

    // ... and the Window props.
});

const emit = defineEmits(["submit"]);

const formRef = ref(null);

function onSubmit(state) {
    // jsl Form does not reset the form if the form failed. For PIN entry, resetting on failure is a better choice.
    state.resetOnFailure = true;

    emit("submit", state);
}

function onClose() {
    formRef?.value?.reset?.();
}
</script>
