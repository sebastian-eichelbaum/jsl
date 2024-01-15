<!--
A form template that provides quite some customization points as well as the base form and value validation logic.

This is only a view. It does not provide any control logic. Subscribe to the emitted events and act accordingly.

* The anonymous slot forwards the disabled and loading properties. Use them in your component if needed.
* Slot "error" is used to show errors. It gets passed "errorMsg". If this is set, the error should show up 
  Instead of overriding it, some properties are defined to tune the error box.
-->

<template>
    <BusyOverlay :busy="!noBusyOverlay && isBusy">
        <v-row>
            <v-col cols="12" v-if="title" :align="titleAlign">
                <span :class="titleClass" :style="titleStyle">{{ localization.tt(title) }}</span>
            </v-col>
            <v-col cols="12" v-if="prompt">
                <p :class="promptClass" :style="promptStyle">
                    {{ localization.tt(prompt) }}
                </p>
            </v-col>
            <v-col cols="12">
                <slot name="error" :errorMsg="_errorMsg">
                    <v-scale-transition>
                        <v-row no-gutters class="mb-7" v-if="_errorMsg">
                            <v-col cols="12">
                                <v-alert
                                    :variant="alertVariant"
                                    :prominent="!alertNoProminent"
                                    :density="alertDensity"
                                    :border="alertBorder"
                                    type="error"
                                    :text="localization.tt(_errorMsg)"
                                ></v-alert>
                            </v-col>
                        </v-row>
                    </v-scale-transition>
                </slot>

                <v-form :disabled="noBusyOverlay && isBusy" validate-on="input" @submit.prevent="submit" ref="form">
                    <slot :busy="noBusyOverlay && isBusy">TODO: Provide contents as slot</slot>
                </v-form>
            </v-col>
        </v-row>
    </BusyOverlay>
</template>

<script setup>
import { ref, computed } from "vue";

import { localization } from "@jsl/Localization";
import BusyOverlay from "@jsl/components/BusyOverlay.vue";

const props = defineProps({
    // Title text. Hides the column if empty
    title: { type: String, required: false, default: null },
    // Prompt text. Hides the column if empty
    prompt: { type: String, required: false, default: null },

    // Title classes. Needs to be exhaustive.
    titleClass: { type: String, required: false, default: "text-h4 font-weight-light" },
    // Title style to add.
    titleStyle: { type: String, required: false, default: "opacity: 66%;" },
    // Title alignment
    titleAlign: { type: String, required: false, default: "start" },

    // Prompt classes. Needs to be exhaustive.
    promptClass: { type: String, required: false, default: "text-justify" },
    // Prompt style to add.
    promptStyle: { type: String, required: false, default: "" },

    // v-alert variant for the error msg
    alertVariant: { type: String, required: false, default: "tonal" },
    // v-alert density for the error msg
    alertDensity: { type: String, required: false, default: "compact" },
    // v-alert prominent for the error msg. Use this to make it NOT prominent
    alertNoProminent: { type: Boolean, required: false, default: false },
    // v-alert border for the error msg. Set to false to disable
    alertBorder: { required: false, default: "start" },

    // If true, the form is assumed to be busy
    busy: { type: Boolean, required: false, default: false },

    // If set, the busy overlay is not used. Instead, the form gets marked as disabled and loading
    noBusyOverlay: { type: Boolean, required: false, default: false },
});

const emit = defineEmits([
    // Triggered on valid submission. An object is passed that provides all values.
    "submit",
    // Triggered only when an invalid submission was done.  An object is passed that provides all values.
    "invalid",
]);

const form = ref();

const _busy = ref(false);
const isBusy = computed(() => {
    return props.busy || _busy.value;
});

const _errorMsg = ref("");

async function submit(submitEvent) {
    // This is necessary to ensure a validation is done in any case.
    await form.value.validate();

    // Generate an object containing each item by name, its value and some state info
    const valuesOf = (srcitems) => {
        let items = {};
        let values = {};
        let valid = true;
        srcitems.forEach((item) => {
            valid = valid && item.isValid === true;
            values[item.id] = submitEvent.target.elements[item.id].value;
            items[item.id] = {
                valid: item.isValid === true,
                value: values[item.id],
                component: item,
                reset: item.reset,
            };
        });
        return { valid: valid, items: items, values: values };
    };
    let result = valuesOf(form.value.items);

    // Inject the reset function for convenience
    result["formReset"] = () => {
        if (!form.value) {
            // The component that contained the form was unmounted already.
            return;
        }

        console.log(form.value);
        form.value.reset();
        _errorMsg.value = "";
        _busy.value = false;
    };

    // Set busy state, if setting false, a delay can be used.
    result["formBusy"] = (value = true, outDelayMs = 0) => {
        if (value == false) {
            setTimeout(() => {
                _busy.value = value;
            }, outDelayMs);
        } else {
            _busy.value = value;
        }
    };

    result["formErrorMsg"] = (value = "") => {
        _errorMsg.value = value;
    };

    if (result.valid) {
        emit("submit", result);
    } else {
        emit("invalid", result);
    }
}

function reset() {
    form.value.reset();
}
</script>

<style scoped>
#formRow {
    transition: 0.5s;
}
</style>
