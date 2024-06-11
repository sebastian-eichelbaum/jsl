<!--
Wrapper/decorator on top of inputs/v-inputs and jsl custom inputs. It adds gutter, titles, prompts, ... and provides
some commonly used options.

Fields can instantiate arbitrary inputs. Either, provide a default slot value or provide the type in 'fieldType':

Slots:
* anonymous slot: if filled, you can provide arbitrary inputs for this field. "{busy, model, fieldProps}" is passed.
* named field specific slots: 


Example:
<Form ...>
    // You must use the provided model - see jsl Form for details
    <template v-slot="{ busy, model }">
        <Field
            v-model="model.someName" 
            name="someName"
            title="Cheese"
            prompt='Whats your favorit cheese?'
            :busy="busy"
            :fieldType="text" // Either define the slot type here or use the anonymous slot
            :fieldProps="{clearable: false, 'clear-on-select': false }" // Define arbitrary props for the desired field
        >
            <!-- OR use the slot. The busy state, model and the field props are passed >
            <template v-slot="{ busy, model, fieldProps }">
                ...
            </template>
        </Field>
    </template>
</Form>
-->
<template>
    <v-row>
        <v-col cols="12" v-if="title" :align="titleAlign">
            <span :class="titleClass" :style="titleStyle">{{ tt(title) }}</span>
        </v-col>
        <v-col cols="12" v-if="prompt">
            <p :class="promptClass" :style="promptStyle">
                {{ tt(prompt) }}
            </p>
        </v-col>
        <v-col cols="12">
            <slot :busy="busy" :model="model" :fieldProps="_fieldProps">
                <v-checkbox
                    v-if="fieldType === 'checkbox'"
                    v-bind="{ ...$props, ...$attrs, ..._fieldProps }"
                    v-model="model"
                    :name="name"
                    :rules="rules"
                    :label="_fieldLabel"
                    :disabled="busy || disabled"
                />
                <v-text-field
                    v-else-if="fieldType === 'text'"
                    v-bind="{ ...$props, ...$attrs, ..._fieldProps }"
                    v-model="model"
                    :name="name"
                    :rules="rules"
                    :label="_fieldLabel"
                    :disabled="busy || disabled"
                />
                <v-text-field v-else-if="fieldType === 'combo'" />
                <v-textarea
                    v-else-if="fieldType === 'textarea'"
                    v-bind="{ ...$props, ...$attrs, ..._fieldProps }"
                    v-model="model"
                    :name="name"
                    :rules="rules"
                    :label="_fieldLabel"
                    :disabled="busy || disabled"
                />
                <component
                    :is="fieldType"
                    v-else-if="typeof fieldType == 'object'"
                    v-bind="{ ...$props, ...$attrs, ..._fieldProps }"
                    v-model="model"
                    :name="name"
                    :rules="rules"
                    :label="_fieldLabel"
                    :disabled="busy || disabled"
                >
                    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
                        <slot :name="slot" v-bind="scope" />
                    </template>
                </component>
                <template v-else>
                    {{ tt("common.msg.todo", { what: "Undefined field type and empty slot!" }) }}
                </template>
            </slot>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, computed } from "vue";

import Validators from "@jsl/utils/Validators";

import { tt, Translatable } from "@jsl/Localization";

import { fwdProps, fwdBindProps } from "@jsl/utils/ForwardVueProps";

const model = defineModel();

const props = defineProps({
    // Title text. Hides the column if empty
    title: { type: [String, Translatable], default: null },
    // Prompt text. Hides the column if empty
    prompt: { type: [String, Translatable], default: null },

    // Title classes. Needs to be exhaustive.
    titleClass: { type: String, default: "text-h5 font-weight-light" },
    // Title style to add.
    titleStyle: { type: String, default: "opacity: 66%;" },
    // Title alignment
    titleAlign: { type: String, required: false, default: "start" },

    // Prompt classes. Needs to be exhaustive.
    promptClass: { type: String, default: "text-justify" },
    // Prompt style to add.
    promptStyle: { type: String, default: "" },

    // Indicate the owning form is busy. When true, the field will be disabled for input.
    busy: { type: Boolean, default: false },

    // Disabled the field, independent of its busy state
    disabled: { type: Boolean, default: false },

    // If the anonymous slot is not explicitly set this component defines a field. These props allow to configure them:

    // The type of field. Currently supported: "checkbox, text, textarea" and an arbitrary component object
    fieldType: { type: [String, Object], default: "text" },
    // The label of the field. If unset, no label is used. If set to "$title", the title of this Field is used.
    label: { type: [String, Translatable], default: "$title" },
    // The name of the field.
    name: { type: String, required: false, default: null },
    // Rules to apply. By default, a field is required.
    rules: { type: Array, default: [Validators.required()] },

    // Properties to pass to the created input field
    ...fwdProps("fieldProps"),
});

const _fieldLabel = computed(() => {
    return props.label === "$title" ? props.title : props.label;
});

const _fieldProps = fwdBindProps("fieldProps", props, (allProps, fwdProps) => {
    return {
        // Especially on touch devices, this should be the default, always!
        clearable: true,
        // False by default as it is mostly useful for multiple-selections. Supported by v-select, v-autocomplete, SelectAsync, ...
        "closable-chips": allProps?.multiple || fwdProps?.multiple || false,
        // Clears the search field once a selection is done. Supported by v-select, v-autocomplete, SelectAsync, ...
        "clear-on-select": true,
    };
});
</script>
