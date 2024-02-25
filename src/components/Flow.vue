<!--
Flow is a tool to go through Form components, step by step. Each steps result is recorded. Perfect for building wizards
and the like.

* slot "done" is show once all steps have finished

Example:

<Flow :steps="steps" @ok="onOK" resultMapper="resultMapper">
    // result is the return value of resultMapper
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

// Transforms the single-step results in steps to some arbitrary result as needed.
function resultMapper(stepResults, mapped)
{
    // take the values. "result" contains the value returned by the submit handler of the step's form
    return {
        name: stepResults[0].result.name,
        path: stepResults[0].result.path,
    };

    // or use mapped: it maps the step.id to its value:
    return {
        name: mapped["CreateWorkingDir"].result.name,
        path: mapped["CreateWorkingDir"].result.path,
    };
 
    // If no mapper is defined, the default mapped "mapped" will be used
    // I.e.

    // { 
    //   "CreateWorkingDir": {
    //     "path": "/home/seb/Daten/EffigosTest",
    //     "name": "asd"
    //   },
    //   "SelectComponent": "hedA911",
    //   "SelectContext": ["legM911"]
    // }
}

// Called when OK, receives the mapped result from resultMapper
function onOK(result)
{
    console.log(result);
}

-->

<template>
    <Multiplexer :selected="_stepId">
        <template v-for="(s, index) in _steps" :key="id" #[s.id]>
            <component :is="s.component" v-model:values="s.model" v-bind="s.props" :step="index + 1" @ok="s.ok" />
        </template>

        <template #___done>
            <!-- Show the steps and their results as JSON -->
            <slot name="done" :result="_mappedResult">
                {{ _steps }}
            </slot>
        </template>
    </Multiplexer>
</template>

<script>
// Simple mapper that maps each step.id to its step.result.
function defaultMapper(state) {
    const result = {};
    for (const s of state) {
        result[s.id] = s.result;
    }
    return result;
}
</script>

<script setup>
import { ref, reactive, computed, onMounted, markRaw } from "vue";

import Multiplexer from "@jsl/components/Multiplexer.vue";

const props = defineProps({
    // Step definitions
    steps: { type: Array, required: true, default: [] },

    // Maps the steps results to some custom result object of your liking.
    // If not set, an object { ...step.id: step.result} is returned
    // As second param, the default mapped results are passed on for convenience.
    resultMapper: {
        type: Function,
        required: false,
        default: (
            // Raw step results
            stepsResult,

            // Also pass the default mapped stuff. Might be useful to the user
            mapped,
        ) => defaultMapper(stepsResult),
    },
});

const emit = defineEmits([
    // Triggered on valid, finished flow. First parameter is the result of props.resultMapper, second param is the
    // original steps results, including step info, states, models, and all the internal details.
    "ok",
]);

// Step index
const _step = ref(0);

// Flow result after all steps are done.
let _mappedResult = {};

// The steps as given via props but prepared an enhanced to be used her.
const _steps = ref([]);

// Takes the steps prop and prepares the internal steps collection.
onMounted(() => {
    if (props.steps.length == 0) {
        throw new Error("No steps defined.");
    }

    let stepsResult = [];
    _mappedResult = {};

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
            // State is the object send along OK in jsl Form.vue
            step.result = state.result;
            step.state = state.state;
            _step.value++;

            if (isDone()) {
                _mappedResult = defaultMapper(stepsResult);
                if (props.resultMapper != null) {
                    _mappedResult = props?.resultMapper?.(stepsResult, _mappedResult);
                }
                emit("ok", _mappedResult, stepsResult);
            }
        };

        if (step.model == null) {
            step.model = reactive({});
        }

        if (step.props == null) {
            step.props = {};
        }

        stepsResult.push(step);
    }

    // NOTE: markRaw avoids making all elements reactive proxy objects as this affects performance
    _steps.value = markRaw(stepsResult);
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
