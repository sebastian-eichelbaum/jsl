<!--
A simple bug reporting dialog.

<template>
    ...
    <SendBugReport ref="bugReporter">
</template>

<script setup>
import {SendBugReport} from "jsl/components/utils/SendBugReport.vue"

const bugReporter = ref();

// Creates a bug report. Call from somewhere
async function reportError()
{
    // resolves once the bug reporter closes (never rejects)
    return bugReporter.value.sendReport({
        attachments: [{ name: "common.ui.consoleLog", data: "some data" }],
    });
}

</script>

-->
<template>
    <Window
        title="common.prompt.sendBugReport"
        icon="mdi-bug"
        noGreetBox
        greetText="common.ui.bugReport"
        greetSubtext="common.msg.sendBugReport"
        maxWidth="900"
        titleBackground="error"
        v-bind="{ ...$props, ...$attrs }"
        :allowClose="!busy"
        v-model="model"
        @close="onClose"
    >
        <v-alert
            v-if="!isAvailable"
            icon="mdi-cloud-off-outline"
            :title="tt('common.ui.unavailable').toString()"
            :text="tt('common.msg.serviceUnavailable').toString()"
        ></v-alert>

        <v-card :disabled="!isAvailable">
            <v-card-item class="ml-2 mr-2 pb-5">
                <Form
                    ref="form"
                    enableBack
                    asGrid
                    :okIndicatorDuration="2000"
                    @submit="onSubmit"
                    @ok="onClose"
                    @back="onClose"
                    @busy="busyUpdate"
                    @reset="onReset"
                    :initHandler="onInit"
                    submitIcon="mdi-send"
                    backText="common.ui.abort"
                >
                    <template v-slot="{ busy, model }">
                        <Field
                            :rules="[Validators.email()]"
                            v-model="model.sender"
                            name="sender"
                            :busy="busy"
                            :title="tt('form.ui.sender', { what: tt('form.ui.email') })"
                        />
                        <Field
                            fieldType="textarea"
                            :busy="busy"
                            v-model="model.description"
                            name="description"
                            title="form.ui.description"
                            prompt="common.msg.sendBugReport"
                        />
                        <p v-if="hasAttachments" class="text-h5 font-weight-light" style="opacity: 66%">
                            {{ tt("common.ui.attachment").plural() }}
                        </p>
                        <span v-for="item of allAttachments"><v-icon icon="mdi-paperclip" /> {{ tt(item.name) }}</span>
                    </template>
                </Form>
            </v-card-item>
        </v-card>
    </Window>
</template>

<script setup>
import { ref, computed } from "vue";

import { tt } from "jsl/Localization";

import Window from "jsl/components/dialogs/Window.vue";
import Form from "jsl/components/forms/Form.vue";
import Field from "jsl/components/forms/Field.vue";

import Validators from "jsl/utils/Validators";

import { persistance } from "jsl/Persistance";
import { wait } from "jsl/utils/Await";

import { backend } from "jsl/Backend";

const model = defineModel({ default: false });
const busy = ref(false);
const form = ref();

const explicitAttachments = ref([]);
const hasAttachments = computed(() => {
    return allAttachments.value.length > 0;
});

const allAttachments = computed(() => {
    return [...explicitAttachments.value, ...props.attachments];
});

let dialogPromise = null;

const props = defineProps({
    // A list of attachments: Title to show
    attachments: { type: Array, default: [] },
});

function busyUpdate(value) {
    busy.value = value;
}

const isAvailable = computed(() => {
    return backend?.bugReport != null;
});

function onClose() {
    model.value = false;
    form.value.reset();
    dialogPromise?.resolve?.();
}

async function onSubmit(state) {
    await state.action(async (state) => {
        persistance.in("jsl").in("sendBugReport").in("mru").set("sender", state.values.sender);

        const reporter = backend?.bugReport;
        if (reporter == null) {
            throw "common.msg.sendBugReportFailed";
        }
        await reporter
            .send({
                sender: state.values.sender,
                description: state.values.description,
                attachments: allAttachments.value,
            })
            .catch((e) => {
                throw "common.msg.sendBugReportFailed";
            });

        return;
    });
}

function onInit(model) {
    onReset(model);
}

function onReset(model) {
    model.sender = persistance.in("jsl").in("sendBugReport").in("mru").get("sender");
}

async function sendReport(config) {
    const p = new Promise((resolve, reject) => {
        dialogPromise = { resolve: resolve, reject: reject };
    });
    model.value = true;

    explicitAttachments.value = config?.attachments || [];

    return p.finally(() => {
        dialogPromise = null;
    });
}

defineExpose({
    sendReport,
});
</script>
