<!--
A nice busy overlay spinner with rounded percent and message display.

* The slot "spinner" can be used to override the spinner itself. Provides "message" and "percent"

<Busy:busy="true" msg="common.msg.greet" :percent="12">
    <template #spinner="{ message, percent }"> Textspinner huiiii: {{ percent }} {{ message }} </template>
</Busy>
-->

<template>
    <v-fade-transition mode="out-in">
        <div id="overlay" v-if="busy">
            <div id="overlayContent">
                <slot name="spinner" :message="msg" :percent="roundedPercent">
                    <v-progress-circular
                        :size="spinnerSize"
                        :width="spinnerWidth"
                        :color="spinnerColor"
                        :indeterminate="isIndeterminate"
                        :model-value="roundedPercent"
                        id="spinner"
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

import { localization } from "jsl/Localization";

const props = defineProps({
    // Make this an overlay?
    overlay: { type: Boolean, default: false },

    // If true, the form is assumed to be busy
    busy: { type: Boolean, required: false, default: false },

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

#spinner {
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
