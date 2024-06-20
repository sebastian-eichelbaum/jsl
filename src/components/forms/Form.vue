<!--
A form template that provides quite some customization points as well as the base form and value validation logic.

Forms are used to collect data, not to perform operations. Always create a second component that does the actual stuff.

Slots:

* anonymous slot: { busy, model } - use to fill the form with fields. NOTE: you HAVE to use the provided model to make
                  the automatic value collection work properly. See example below!
* footer: { busy, model } - The area below the contents. If overwritten, you have to provide your own SubmitButton
* footerStart: { busy, model } - if the footer slot is not overwritten, this is the left side of the footer. Empty by
               default.
* footerEnd: { busy, model } - if the footer slot is not overwritten, this is the right side of the footer and provides
             a submit button by default.

Emits:

@submit(formState) - When the form is valid and the user submitted it.
@ok(formState, result) - Once the action has completed successfully .
@failed(formState, error) - If an action on a submitted form failed.

Example:

<Form ... @submit="do" :initHandler="doInit">
    // It is important that all fields use the model provided by the form.
    // This ensures that the form can get and forward all values properly.
    <template v-slot="{ busy, model }">
        // use jsl Field. It is rather generic and provides some common title+prompt UI and gutter
        <Field
            // Use the model and store the values in some property of the model
            v-model="model.someName"
            // The name (passed down to HTML) has to match the v-model property used
            name="someName"
        />
        // OR: use your own
        <v-text-field v-model
            v-model="model.someName"
            name="someName"
        />
    </template>

    // There are more slots: footerStart, footerEnd, footer - a default submit button is present in the footer.
    // If you want to keep the default submit button but add something at footer-left, use the footerStart slot.
</Form>

async function do(state)
{
    // state.values contains the model values of all fields that used the model
    // Make sure that all fields use the form-provided model!
    console.log(state.values);

    // DO NOT handle the form directly. There is a safely wrapped callback that, if you throw, shows a nice error and
    // puts the form in a defined error state.
    state.action(
        // Custom  handler, OR: provide this handler via the submitAction property of the form
        async (state) => {

        if(state.damn)
        {
            // Throw errors, BUT: for known errors, provide a Translatable! It will be shown in the form.
            throw tt("common.msg.greet", {user: 'Hans'})
        }

        await api(); // if this fails, the form handles the error nicely. You might want to consider translating API
                     // specific errors to some Translatable or string.
    });
}

async function doInit(model) {

    const allComponents = await api.fetchStuff();

    // The given modes is an object where each key is the name of one of the fields v-model key.
    model.components = allComponents;
    model.someName = true;

    // If you throw, the form shows an error. If not, you can define a state. NOTE: form always sets busy false after
    // init.
    return { busy: false };
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
                    <FormError v-if="alertPosition == 'aboveForm'" v-bind="alertProps" :message="_errorMsg" />

                    <v-form
                        :disabled="(noBusyOverlay && isBusy) || disabled"
                        validate-on="input"
                        @submit.prevent="submit"
                        ref="form"
                    >
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

                            <FormError v-if="alertPosition == 'aboveFooter'" v-bind="alertProps" :message="_errorMsg" />
                            <slot name="footer" :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                <v-row style="align-content: center">
                                    <v-col align="start">
                                        <slot name="footerStart" :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                            <BackButton
                                                v-if="enableBack"
                                                :loading="busy"
                                                :text="backText"
                                                :color="backColor"
                                                :icon="backIcon"
                                                :variant="backVariant"
                                                :disabled="disabled"
                                                @click="onBack"
                                            />
                                        </slot>
                                    </v-col>
                                    <v-spacer />
                                    <v-col align="end">
                                        <slot name="footerEnd" :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                            <SubmitButton
                                                v-if="!noSubmit"
                                                :loading="busy"
                                                :text="submitText"
                                                :color="submitColor"
                                                :icon="submitIcon"
                                            />
                                        </slot>
                                    </v-col>
                                </v-row>
                            </slot>
                            <FormError v-if="alertPosition == 'belowFooter'" v-bind="alertProps" :message="_errorMsg" />
                        </Grid>
                        <v-row v-else-if="asRow" v-bind="row">
                            <slot :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                {{ tt("common.msg.todo", { what: "default slot!" }) }}
                            </slot>

                            <!-- NOTE: do not make an assumption on how the user designs its footer. DO NOT wrap this in
                            v-col! Users might want to split the footer, align it, ... They provide the v-col. -->
                            <FormError v-if="alertPosition == 'aboveFooter'" v-bind="alertProps" :message="_errorMsg" />
                            <slot name="footer" :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                <v-col cols="12">
                                    <v-row style="align-content: center">
                                        <v-col align="start">
                                            <slot
                                                name="footerStart"
                                                :busy="noBusyOverlay && isBusy"
                                                :model="valuesModel"
                                            >
                                                <BackButton
                                                    v-if="enableBack"
                                                    :loading="busy"
                                                    :text="backText"
                                                    :color="backColor"
                                                    :icon="backIcon"
                                                    :variant="backVariant"
                                                    rounded="xl"
                                                    size="large"
                                                    :disabled="disabled"
                                                    @click="onBack"
                                                />
                                            </slot>
                                        </v-col>
                                        <v-spacer />
                                        <v-col align="end">
                                            <slot name="footerEnd" :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                                <SubmitButton
                                                    v-if="!noSubmit"
                                                    :loading="busy"
                                                    :text="submitText"
                                                    :color="submitColor"
                                                    :icon="submitIcon"
                                                    :variant="submitVariant"
                                                    :disabled="disabled"
                                                />
                                            </slot>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </slot>
                            <FormError v-if="alertPosition == 'belowFooter'" v-bind="alertProps" :message="_errorMsg" />
                        </v-row>
                        <template v-else>
                            <slot :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                {{ tt("common.msg.todo", { what: "default slot!" }) }}
                            </slot>

                            <FormError v-if="alertPosition == 'aboveFooter'" v-bind="alertProps" :message="_errorMsg" />
                            <slot name="footer" :busy="noBusyOverlay && isBusy" :model="valuesModel">
                                {{ tt("common.msg.todo", { what: "footer slot!" }) }}
                            </slot>
                            <FormError v-if="alertPosition == 'belowFooter'" v-bind="alertProps" :message="_errorMsg" />
                        </template>
                    </v-form>

                    <FormError v-if="alertPosition == 'belowForm'" v-bind="alertProps" :message="_errorMsg" />
                </v-col>
            </v-row>
        </BusyOverlay>
    </div>
</template>

<script setup>
import { ref, reactive, computed, markRaw, onMounted, watch } from "vue";
import _ from "lodash";

import { Translatable, tt } from "jsl/Localization";
import { fwdProps, fwdBindProps } from "jsl/utils/ForwardVueProps";

import BusyOverlay from "jsl/components/BusyOverlay.vue";
import Grid from "jsl/components/Grid.vue";

import SubmitButton from "jsl/components/forms/SubmitButton.vue";
import BackButton from "jsl/components/forms/BackButton.vue";

import FormError from "jsl/components/forms/Error.vue";

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

    // Icon to use for the default submit button
    submitIcon: { type: String, required: false, default: "mdi-check" },
    // Variant of the submit button
    submitVariant: { type: String, required: false, default: "flat" },
    // Button color to use for the default submit button
    submitColor: { type: String, required: false, default: "primary" },
    // Button text for the default submit button.
    submitText: { type: String, required: false, default: null },
    // If set, invalid forms get submitted. The submit-handler has to take care of it.
    submitInvalid: { type: Boolean, required: false, default: false },

    // Icon to use for the default back button
    backIcon: { type: String, required: false, default: "mdi-arrow-left-thin" },
    // Variant of the back button
    backVariant: { type: String, required: false, default: "flat" },
    // Button color to use for the default back button
    backColor: { type: String, required: false, default: "surface" },
    // Button text for the default back button.
    backText: { type: [String, Translatable], required: false, default: "common.ui.back" },

    // If set, the default submit button is disabled. Handy if submit should be handled somewhere else. NOTE: the
    // default submit button is inside the #footerEnd slot. You can also just override this slot to disable the submit
    // button
    noSubmit: { type: Boolean, required: false, default: false },

    // Disable the whole form without marking it busy? Use this if you need to avoid any user input.
    disabled: { type: Boolean, required: false, default: false },

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

    // If set, a back button is added to footerStart by default. It emits the "back" signal. This is false by default
    // as it only makes sense for sequences of forms. Flow can handle this for example.
    enableBack: { type: Boolean, default: false },

    // Forward all grid props
    ...fwdProps("grid"),
    // Forward all v-row props
    ...fwdProps("row"),

    // Model for field values. Forwarded to the default slot. You can set this to capture or modify field values easily.
    // The object members are named as the fields "name" properties.
    values: { type: Object, default: reactive({}) },

    // This function (if set) will be called upon submission, if all values pass the validation. This should be an async
    // function that takes the data and performs the action. If it fails/throws, the form shows an error and emits
    // @failed. If it succeeds, the form sends @ok.
    //
    // NOTE: Set this ONLY in the consuming component. Chaining these is not intended.
    //
    // Signature: (formState)=>{ return someThing }
    submitAction: { type: Function, default: null },

    // This function will be called upon mount/init. It gets the model passed and can throw or return a NewState
    // instance (see setState). If set, the form is marked as busy before calling it.
    initHandler: { type: Function, default: null },
});

const emit = defineEmits([
    // Triggered on valid submission. An object is passed that provides all values. This is called once all fields
    // comply to the given rules.
    "submit",

    // When the form is reset. The form model is passed as argument. Fill the values as needed.
    "reset",

    // Called on mount. Use this to init default values externally. The model is passed as first parameter. Be aware
    // that multiple subscribers might modify the model. Use this only if you have a fast and synchronous init function.
    // If more complex, async init is needed, use the initHandler property.
    "init",

    // Triggered on model update
    "input",

    // Triggered on field value update (technically the same as input, but managed by VUE's v-model mechanics)
    "update:values",

    // The submitted form worked as expected. An object {state, result} is provided. Values is the set of
    // original form values, result is the result of the action function.
    "ok",
    // The submitted form failed. An object {state, error} is provided. Values is the set of
    // original form values, error is the caught exception.
    "failed",

    // The user requested to go back one step. Only emitted if enableBack is true and the default footerStart is not
    // overwritten.
    "back",

    // Informs about the busy state of the form. This emits on each update of props.busy or when the form is busy due to
    // its submit handler. A boolean is passed - true if busy
    "busy",
]);

const form = ref();

// Expose some vars to the outside
defineExpose({
    form,
    reset,
});

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

const _busy = ref(false);
const isBusy = computed(() => {
    return props.busy || _busy.value;
});
watch(isBusy, (newVal, oldVal) => {
    emit("busy", newVal || false);
});

const _errorMsg = ref();

async function submit(submitEvent) {
    try {
        setState({ busy: true });

        // This is necessary to ensure a validation is done in any case.
        if (!(await form.value.validate()).valid && !props.submitInvalid) {
            setState({ busy: false });
            return;
        }

        // Generate an object containing each item by name, its value and some state info
        const valuesOf = (srcitems) => {
            let items = {};
            let values = {};
            let valid = true;
            srcitems.forEach((item) => {
                valid = valid && item.isValid === true;

                // inputs that are not plain text will not provide "value"
                // We prefer the form model value for this item if it exists.
                values[item.id] = valuesModel?.value?.[item.id] || submitEvent.target.elements[item.id].value;

                items[item.id] = {
                    valid: item.isValid === true,
                    value: values[item.id],
                    component: item,
                    reset: item.reset,
                };
            });
            return { valid: valid, items: items, values: values };
        };
        let formState = valuesOf(form.value.items);

        // Not supported everywhere yet
        // const {promise, resolve, reject } = Promise.withResolvers();

        // Create a promise that can be resolved/rejected somewhere in a submit handler.
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        })
            // Once the user calls "action", we reach this
            .then((handler) => {
                const action = handler || props.submitAction;
                if (action == null) {
                    throw new Error(
                        "No action handler defined. Define submitAction to the form or provide it when calling 'action'",
                    );
                }
                if (!formState.valid) {
                    throw tt("form.msg.inputNotValidated");
                }

                return action(formState);
            })
            .then((result) => {
                setState(
                    _.merge(
                        { reset: formState?.resetOnOK || true, busy: false, busyDelay: 500, error: null },
                        {
                            // TODO: find a way to inject this from the action handler
                        },
                    ),
                );

                emit("ok", { state: formState, result: result });
                return result;
            })
            // If anything goes wrong along the way:
            .catch((error) => {
                let err = { error: error, errorDetail: null }; // works nicely for Translatable
                if (typeof error === "string" || error instanceof String) {
                    err.error = tt(error);
                } else if (error instanceof Error) {
                    console.error("Unknown error during submission", error);
                    err.error = "common.msg.unknownError";
                    err.errorDetail = { error: error.name + " - " + tt(error.message) };
                }

                setState({
                    reset: formState?.resetOnFailure || false,
                    busy: false,
                    busyDelay: formState.valid ? 500 : 0,
                    ...err,
                });

                emit("failed", { state: formState || {}, error: error });
            });

        // A comfortable handler that calls a given submit action and handles its outcome properly.
        formState["action"] = (handler = null) => {
            resolve(handler);
            // Allows the caller of "action" to await it and get its result or error
            return promise;
        };

        // Call in your submit handler if something is wrong. Pass in an Exeption or Translatable or string - it will be
        // shown as error in the form
        formState["fail"] = (error) => reject(error);

        formState["resetOnOK"] = true;
        formState["resetOnFailure"] = false;

        emit("submit", formState);

        // Finally, wait for this promise.
        await promise;
    } catch (e) {
        // This will catch any issues with the form-value magic. The promise that is passed using the emits already
        // catches
        setState({
            busy: false,
            busyDelay: 100,
            error: "common.msg.unknownError",
            errorDetail: { error: e },
        });

        emit("failed", { state: null, error: e });

        // It does not matter if we rethrow or not. Nobody will be able to catch and handle it.
        // throw e;
        console.error("Error during form submission", e);
    }
}

// Handle the initialization of the form. If the handler throws, this reports the error but does NOT report failure
async function init() {
    if (typeof props.initHandler != "function") {
        setState({ busy: false });
        emit("init", valuesModel.value);
        return;
    }

    try {
        setState({ busy: true });
        setState(await props.initHandler(valuesModel.value));
        setState({ busy: false });
    } catch (e) {
        // This will catch any issues with the form-value magic. The promise that is passed using the emits already
        // catches
        setState({
            busy: false,
            busyDelay: 100,
            error: "common.msg.unknownError",
            errorDetail: { error: e },
        });

        emit("failed", { state: null, error: e });
    }
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
        reset();
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
 * Report model changes.
 */
watch(props.values, (newValue, oldValue) => {
    emit("input", valuesModel.value);
});

/**
 * On mount is init - notify any listeners and let them init the model.
 */
onMounted(() => {
    init();
});

/**
 * Reset the form.
 * From the outside, use:
 * <Form .... ref="myForm">
 * const myForm = ref();
 * myForm.value.reset();
 */
function reset() {
    form?.value?.reset?.();
    emit("reset", valuesModel.value);
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

/**
 * Handle back events.
 */
function onBack()
{
    emit("back");
}

</script>

<style scoped>
#formRow {
    transition: 0.5s;
}
</style>
