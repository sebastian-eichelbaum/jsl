<template>
    <v-text-field
        v-model="model"
        :label="localization.tt(label)"
        :rules="optional ? [] : [Validators.required()]"
        clearable
        :name="name"
    ></v-text-field>
</template>

<script setup>
import { ref } from "vue";

import Validators from "@jsl/utils/Validators";
import { localization } from "@jsl/Localization";

const props = defineProps({
    // The label of the field
    label: { type: String, required: false, default: "form.ui.company" },
    // The name to use to identify the value
    name: { type: String, required: false, default: "company" },

    // Set to make the field optional
    optional: { type: Boolean, required: false, default: false },
});

// Value model
const model = defineModel();
</script>
