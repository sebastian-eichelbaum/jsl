<!--
ActionForm wraps around Form and allows to set an async function as action handler. You do not have to manage form
state. Provide an async function that performs an operation and return or throw on error.

Like jsl Form, you HAVE to use the form-provided model. Refer to jsl Form for an example.


Example:

<ActionForm
    asGrid
    title="Choose some cheese"
    titlePrefix="1."
    prompt="Chose your favorite cheese, please."
    :action="doAction"
>
    <template v-slot="{ busy, model }">
        <Field
            // see jsl Field
            v-model="model.name"
            name="name"
        />
    </template>

    <template v-slot:footer="{ busy }">
        <SubmitButton justify-self="end" :loading="busy" text="" color="primary" icon="mdi-arrow-right-thin" />
    </template>
</ActionForm>

async function doAction(state) {
    // The state var contains fields named like the input fields.
    console.log(state)

    // Do something with the values. You can transform them or whatever and return a new state.
    return {
        trimmedName: state.name.trim()
    };
}

-->
<template>
    <Form v-bind="{ ...$props, ...$attrs }" @invalid="onInvalid" @submit="onSubmit">
        <template v-for="(_, slot) of $slots" v-slot:[slot]="scope"><slot :name="slot" v-bind="scope" /></template>
    </Form>
</template>

<script setup>
import Form from "@jsl/components/forms/Form.vue";

const props = defineProps({
    // This form is probably part of a sequence. If so, you can pass in the step num that will be used as title prefix
    // Negative numbers disable that
    action: { type: Function, required: true, default: null },
});

const emit = defineEmits([
    // The submitted the form and it worked as expected. An object {values, result} is provided. Values is the set of
    // original form values, result is the result of the action function.
    "ok",
    // The submitted form failed. An object {values, error} is provided. Values is the set of
    // original form values, error is the caught exception.
    "failed",
]);

async function onInvalid(state) {
    state.failed();
}

async function onSubmit(state) {
    if (props.action == null) {
        state.failed({ error: "common.msg.unknownError", errorDetail: { error: "No action defined" } });
        return;
    }

    await props
        .action(state?.values)
        .then((result) => {
            emit("ok", { values: state?.values || {}, result: result });
            state.ok();
        })
        .catch((error) => {
            emit("failed", { values: state?.values || {}, error: error });
            if (error?.message != null) {
                state.failed({ error: "common.msg.unknownError", errorDetail: { error: error.message } });
            } else {
                state.failed({ error: error });
            }
        });
}
</script>
