<!--
Flow is a tool to go through ActionForm components, step by step. Each steps result is recorded.

* slot "done" is show once all steps have finished

Example:

<Flow :steps="steps" @ok="onOK">
    <template #done="{ result }"> Done: {{ result }} </template>
</Flow>

const steps = [
    {
        id: "CreateWorkingDir",
        component: CreateWorkingDir,
        props:{ ... }, // pass these props to the component
    },
    ...
];

function onOK(result)
{
    // Result is an array, one entry per step. Each step is enriched with a field "result" that contains the original
    // result of the ActionForm of that step
    console.log(result);
}

-->

<template>
    <Multiplexer :selected="_stepId">
        <template v-for="(s, index) in _steps" :key="id" #[s.id]>
            <component :is="s.component" v-model:values="s.model" v-bind="s.props" :step="index + 1" @ok="s.ok" />
        </template>

        <template #___done>
            <slot name="done" :result="_steps">
                {{ _steps }}
            </slot>
        </template>
    </Multiplexer>
</template>

<script>
class FlowStep {
    constructor() {}
}
</script>

<script setup>
import { ref, reactive, computed, onMounted, markRaw } from "vue";

import Multiplexer from "@jsl/components/Multiplexer.vue";

const props = defineProps({
    // Step definitions
    steps: { type: Array, required: true, default: [] },
});

const emit = defineEmits([
    // Triggered on valid, finished flow. An object is passed that provides all values.
    "ok",
]);

// Step index
const _step = ref(0);

// The steps as given via props but prepared an enhanced to be used her.
const _steps = ref([]);

// Takes the steps prop and prepares the internal steps collection.
onMounted(() => {
    if (props.steps.length == 0) {
        throw new Error("No steps defined.");
    }

    let result = [];
    for (let step of props.steps) {
        if (!step.id) {
            throw new Error("Each step requires an ID.");
        }

        if (step.component == null) {
            throw new Error("Each step requires a component.");
        }

        if (!(typeof step.id === "string" || step.id instanceof String)) {
            throw new Error("Each step requires a string ID.");
        }

        step.ok = (state) => {
            step.result = state;
            _step.value++;

            if (isDone()) {
                emit("ok", result);
            }
        };

        if (step.model == null) {
            step.model = reactive({});
        }

        if (step.props == null) {
            step.props = {};
        }

        result.push(step);
    }

    // NOTE: markRaw avoids making all elements reactive proxy objects as this affects performance
    _steps.value = markRaw(result);
});

// Currently active step id
const _stepId = computed(() => {
    return isDone() ? "___done" : props.steps[_step.value].id;
});

/**
 * Checks if the flow has processed all steps
 *
 * @returns {Boolean} true if done
 */
function isDone() {
    return props.steps.length <= _step.value;
}
</script>
