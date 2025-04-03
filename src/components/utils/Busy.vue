<!--
A nice busy overlay spinner with rounded percent and message display.

* The slot "spinner" can be used to override the spinner itself. Provides "message" and "percent"

<Busy:busy="true" msg="common.msg.greet" :percent="12">
    <template #spinner="{ message, percent }"> Textspinner huiiii: {{ percent }} {{ message }} </template>
</Busy>
-->

<template>
    <v-fade-transition mode="out-in">
        <div id="overlay" v-if="failed">
            <div id="overlayContent">
                <v-icon icon="mdi-close" size="x-large" class="spinner" :color="failedColor" />
                <p class="text-body-2 pr-10 pl-10 pt-4 font-weight-bold">{{ tt(failedMessage) }}</p>
            </div>
        </div>
        <div id="overlay" v-if="ok && !failed">
            <div id="overlayContent">
                <v-icon icon="mdi-check" size="x-large" class="spinner" :color="okColor" />
            </div>
        </div>
        <div id="overlay" v-if="busy && !ok && !failed">
            <div id="overlayContent">
                <slot name="spinner" :message="msg" :percent="roundedPercent">
                    <v-progress-circular
                        :size="spinnerSize"
                        :width="spinnerWidth"
                        :color="spinnerColor"
                        :bg-color="spinnerBackgroundColor"
                        :indeterminate="isIndeterminate"
                        :model-value="roundedPercent"
                        class="spinner"
                    >
                        <span v-if="roundedPercent >= 0" class="font-weight-bold">{{ roundedPercent }}%</span>
                    </v-progress-circular>
                    <p v-if="msg" class="mt-5" align="center">{{ localization.tt(msg) }}</p>
                </slot>
            </div>
        </div>
    </v-fade-transition>
</template>

<script setup>
import { ref, watch, computed } from "vue";

import { localization, Translatable, tt } from "jsl/Localization";

const props = defineProps({
    // Make this an overlay?
    overlay: { type: Boolean, default: false },

    // If true, the form is assumed to be busy
    busy: { type: Boolean, required: false, default: false },

    // If true, show a small check icon instead of the spinner
    ok: { type: Boolean, required: false, default: false },
    // Set true to indicate a failure. Overrides "OK"
    failed: { type: Boolean, required: false, default: false },
    // Message to show on failure
    failedMessage: { type: [String, Translatable], required: false, default: null },

    // Color to use for the OK and failure icons
    okColor: { type: String, required: false, default: "success" },
    failedColor: { type: String, required: false, default: "error" },

    // A message to display.
    msg: { type: String, required: false, default: "" },

    // A percentage to display. If negative, the spinner is indeterminate
    percent: { type: Number, required: false, default: -1 },

    // Explicitly set the spinner to indeterminate mode although a percentage might be present
    indeterminate: { type: Boolean, required: false, default: false },

    // If the default overlay is used, this defines the size of the v-progress-circular
    spinnerSize: { required: false, default: 70 },
    // If the default overlay is used, this defines the width of the v-progress-circular
    spinnerWidth: { required: false, default: 5 },
    // If the default overlay is used, this defines the color of the v-progress-circular
    spinnerColor: { type: String, required: false, default: "primary" },
    // The background color of the spinenr
    spinnerBackgroundColor: { type: String, required: false, default: undefined },
});

const roundedPercent = computed(() => Math.round(props.percent == null ? -1 : props.percent));
const isIndeterminate = computed(() => props.indeterminate || props.percent == null || props.percent < 0);

const position = computed(() => {
    return props.overlay === true ? "absolute" : "unset";
});

const translate = computed(() => {
    return props.overlay === true ? "translate(-50%, -50%)" : "unset";
});

const height = computed(() => {
    return props.overlay === true ? "100%" : "unset";
});
</script>

<style scoped>
#overlay {
    position: v-bind(position);
    width: 100%;
    height: v-bind(height);
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
}

.spinner {
    left: 50%;
    transform: translateX(-50%);
}

#overlayContent {
    top: 50%;
    left: 50%;
    transform: v-bind(translate);
    position: v-bind(position);
    width: 100%;
    padding: 1em;
}
</style>
