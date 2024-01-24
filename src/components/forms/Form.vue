<!--
A form template that provides quite some customization points as well as the base form and value validation logic.

* The anonymous slot forwards the disabled and loading properties. Use them in your component if needed.

This is only a view. It does not provide any control logic. Subscribe to the emitted events and act accordingly.
-> the @submit handler gets a struct that represents the sate. It provides a function "ok" and "failed". Somewhere in
the chain, ok or failed HAS to be called. If not, the form stays busy forever.

Example:

<Form ... @submit="do">...</Form>

async function do(state)
{
    // do the heavy lifting
    console.log(state.values);
    // All good?
    state.ok({reset:false, ...}); // @see setState
    // Not good?
    state.failed({error:"Damn!"});
}
-->

<template>
    <div :style="{ 'max-width': maxWidth }">
        <BusyOverlay :busy="!noBusyOverlay && isBusy">
            <v-row>
                <v-col cols="12" v-if="title" :align="titleAlign">
                    <span :class="titleClass" :style="titleStyle">{{ tt(titlePrefix) }} {{ tt(title) }}</span>
                </v-col>
                <v-col cols="12" v-if="prompt">
                    <p :class="promptClass" :style="promptStyle">
                        {{ tt(prompt) }}
                    </p>
                </v-col>
                <v-col cols="12">
                    <Error v-if="alertPosition == 'aboveForm'" v-bind="alertProps" :message="_errorMsg" />

                    <v-form :disabled="noBusyOverlay && isBusy" validate-on="input" @submit.prevent="submit" ref="form">
                        <!-- Define a full width default grid. To override, provide grid props as property "grid" -->
                        <Grid
                            v-if="asGrid"
                            rowGap="1rem"
                            columnGap="1rem"
                            cellWidth="100%"
                            cellHeight="auto"
                            justifyContent="start"
                            v-bind="grid"
                        >
                            <slot :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                {{ tt("common.msg.todo", { what: "default slot!" }) }}
                            </slot>

                            <Error v-if="alertPosition == 'aboveFooter'" v-bind="alertProps" :message="_errorMsg" />
                            <slot name="footer" :busy="noBusyOverlay && isBusy" />
                            <Error v-if="alertPosition == 'belowFooter'" v-bind="alertProps" :message="_errorMsg" />
                        </Grid>
                        <v-row v-else-if="asRow" v-bind="row">
                            <slot :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                {{ tt("common.msg.todo", { what: "default slot!" }) }}
                            </slot>

                            <!-- NOTE: do not make an assumption on how the user designs its footer. DO NOT wrap this in
                            v-col! Users might want to split the footer, align it, ... They provide the v-col. -->
                            <Error v-if="alertPosition == 'aboveFooter'" v-bind="alertProps" :message="_errorMsg" />
                            <slot name="footer" :busy="noBusyOverlay && isBusy" />
                            <Error v-if="alertPosition == 'belowFooter'" v-bind="alertProps" :message="_errorMsg" />
                        </v-row>
                        <template v-else>
                            <slot :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                {{ tt("common.msg.todo", { what: "default slot!" }) }}
                            </slot>

                            <Error v-if="alertPosition == 'aboveFooter'" v-bind="alertProps" :message="_errorMsg" />
                            <slot name="footer" :busy="noBusyOverlay && isBusy" />
                            <Error v-if="alertPosition == 'belowFooter'" v-bind="alertProps" :message="_errorMsg" />
                        </template>
                    </v-form>

                    <Error v-if="alertPosition == 'belowForm'" v-bind="alertProps" :message="_errorMsg" />
                </v-col>
            </v-row>
        </BusyOverlay>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import _ from "lodash";

import { Translatable, tt } from "@jsl/Localization";
import { fwdProps, fwdBindProps } from "@jsl/utils/ForwardVueProps";

import BusyOverlay from "@jsl/components/BusyOverlay.vue";
import Grid from "@jsl/components/Grid.vue";

import Error from "@jsl/components/forms/Error.vue";

const props = defineProps({
    // Title text. Hides the column if empty
    title: { type: [String, Translatable], required: false, default: null },
    // Prefix the title with this. Very handy to add enumeration or other things to a title dynamically.
    titlePrefix: { type: [String, Translatable], required: false, default: null },
    // Prompt text. Hides the column if empty
    prompt: { type: [String, Translatable], required: false, default: null },

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

    // v-alert props to use for error messages
    ...fwdProps("alert"),

    // v-alert position. Possible values: "aboveForm", "aboveFooter", "belowFooter"
    alertPosition: { type: String, default: "aboveForm" },

    // If true, the form is assumed to be busy
    busy: { type: Boolean, required: false, default: false },

    // If set, the busy overlay is not used. Instead, the form gets marked as disabled and loading
    noBusyOverlay: { type: Boolean, required: false, default: false },

    // If set, the default slot (your form contents) will be inside a jsl/components/Grid.
    asGrid: { type: Boolean, default: false },

    // If set, the default slot (your form contents) will be inside a v-row.
    asRow: { type: Boolean, default: false },

    // Max width of this form
    maxWidth: { type: String, default: "unset" },

    // Forward all grid props
    ...fwdProps("grid"),
    // Forward all v-row props
    ...fwdProps("row"),

    // If set, the form does not reset itself on success. This only affects the default case. If the form listener
    // requests reset explicitly, it will be done, regardless of this value.
    // Use this to retain the form state after submission (especially the values model)
    noAutoReset: { type: Boolean, default: false },

    // Model for field values. Forwarded to the default slot. You can set this to capture or modify field values easily.
    // The object members are named as the fields "name" properties.
    values: { type: Object, default: reactive({}) },
});

const emit = defineEmits([
    // Triggered on valid submission. An object is passed that provides all values.
    "submit",
    // Triggered only when an invalid submission was done.  An object is passed that provides all values.
    "invalid",

    // Triggered on field value update
    "update:values",
]);

const valuesModel = computed({
    get: () => props.values,
    set: (value) => emit("update:values", value),
});

const alertProps = fwdBindProps("alert", props, {
    variant: "tonal",
    density: "compact",
    prominent: true,
    border: "start",
});

const form = ref();

const _busy = ref(false);
const isBusy = computed(() => {
    return props.busy || _busy.value;
});

const _errorMsg = ref();

async function submit(submitEvent) {
    setState({ busy: true });

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

    // Not supported everywhere yet
    // const {promise, resolve, reject } = Promise.withResolvers();
    // Alternative:
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    result["ok"] = resolve;
    result["failed"] = reject;

    if (result.valid) {
        emit("submit", result);
    } else {
        emit("invalid", result);
    }

    await promise
        .then((newState) => {
            setState(_.merge({ reset: !noAutoReset, busy: false, busyDelay: 0, error: null }, newState));
        })
        .catch((newState) => {
            setState(_.merge({ reset: false, busy: false, busyDelay: 500, error: null }, newState));
        });
}

/**
 * Reset the whole form to a new state.
 *
 * @param {Object} newState - a new state as
 *   {
 *      // If set and true, reset the form
 *      reset: false,
 *      // If set and boolean, update busy state
 *      busy: null,
 *      // If set and number, delay busy state update in ms
 *      busyDelay: 0,
 *      // Error string or Translatable passed on to the form error component.
 *      error: "",
 *      // An object that is passed as is to the translation function. Use this to fill in vars in translations.
 *      // Usually, "error" is used in most translations.
 *      errorDetail:{},
 *  }
 */
function setState(newState) {
    if (!form.value) {
        // The component that contained the form was unmounted already.
        return;
    }

    if (newState?.reset === true) {
        form.value.reset();
    }

    // Try to translate this and provide additional details if given
    if (newState?.error != null) {
        _errorMsg.value = tt(newState?.error || "", { ...(newState?.errorDetail || {}) });
    } else {
        _errorMsg.value = null;
    }

    if (newState?.busy != null) {
        setBusy(newState.busy, newState?.busyDelay || 0);
    }
}

/**
 * Set the form busy. This prevents any new submissions
 *
 * @param {Boolean} [value] - The busy state
 * @param {Number} [outDelayMs] - A delay in millisec
 */
function setBusy(value = true, delayMs = 0) {
    setTimeout(() => {
        _busy.value = value;
    }, delayMs);
}
</script>

<style scoped>
#formRow {
    transition: 0.5s;
}
</style>
