<template>
    <v-text-field
        :label="localization.tt(label)"
        :name="name"
        v-model="model"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        @click:append-inner="showPassword = !showPassword"
        :rules="[Validators.lengthRange(minPinLength, maxPinLength), Validators.numbersOnly()]"
    />

    <v-row class="mt-1">
        <v-col v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 'back', 0, 'ok']" :key="num" cols="4" align="center">
            <v-btn
                class="pinBtn"
                v-if="num != null && num !== 'ok'"
                @click="onPinClick(num)"
                :ripple="false"
                :disabled="isDisabled(num)"
                :rounded="roundedButtons"
                :color="color"
                :variant="variant"
            >
                <span v-if="typeof num == 'number'" class="font-weight-bold">{{ num }}</span>
                <v-icon v-if="num == 'back'" icon="mdi-arrow-left-bold" />
            </v-btn>
            <v-fade-transition>
                <v-btn
                    class="pinBtn"
                    v-if="num != null && num === 'ok' && submitEnable && !isDisabled(num)"
                    @click="onSubmit()"
                    :rounded="roundedButtons"
                    type="submit"
                    :color="submitColor"
                    :variant="submitVariant"
                >
                    <v-icon v-if="num == 'ok'" icon="mdi-check-bold" />
                </v-btn>
            </v-fade-transition>
        </v-col>
    </v-row>
</template>

<script setup>
import { computed, ref } from "vue";

import { localization } from "jsl/Localization";

import Validators from "jsl/utils/Validators";

const props = defineProps({
    // The label of the field
    label: { type: String, required: false, default: "form.ui.pin" },

    // The name to use to identify the value
    name: { type: String, required: false, default: "pin" },

    // Roundedness of the buttons
    roundedButtons: { type: String, default: "regular" },

    // Enable the PIN pad OK button? Acts as a form submit!
    submitEnable: { type: Boolean, required: false, default: false },

    // Color of the submit button
    submitColor: { default: "primary" },
    // Color of the pad buttons
    color: { default: "" },

    // v-btn Variant of the submit button
    submitVariant: { default: "flat" },
    // v-btn Variant of the pin buttons
    variant: { default: "tonal" },

    // Limits
    minPinLength: { type: Number, default: 4 },
    maxPinLength: { type: Number, default: 16 },

    // ... and the Window props.
});

const emit = defineEmits([
    // Send if submitEnable is true and the "ok" button was pressed
    // NOTE: not named "submit" to not interfere with the Form submit mechanism.
    "ok",
]);

// The pin field value
const model = defineModel();

// Show/hide pass
const showPassword = ref(false);
const isDisabled = (num) => {
    const pin = model.value || "";
    if (num == "back" && pin.length == 0) {
        return true;
    }

    if (num == "ok" && (pin.length < props.minPinLength || pin.length > props.maxPinLength)) {
        return true;
    }

    if (typeof num == "number" && pin.length >= props.maxPinLength) {
        return true;
    }

    return false;
};

function onSubmit() {
    emit("ok");
}

function onPinClick(num) {
    let pin = model.value || "";
    if (num == "back") {
        pin = pin.substring(0, pin.length - 1);
    }

    if (typeof num == "number") {
        pin = pin + num.toString();
    }
    model.value = pin;
}
</script>

<style scoped>
.pinBtn {
    padding: 10px;
    height: 3.5rem;
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
}

.pinTextBox {
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;

    text-align: center;

    width: 100%;
    height: 3rem;

    margin-top: 10px;
    margin-bottom: 2em;
    padding: 2em;

    background: rgba(0, 0, 0, 0);
    backdrop-filter: brightness(0.8);
}
</style>
