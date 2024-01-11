<template>
    <v-text-field
        v-model="model"
        :label="localization.tt(label)"
        :rules="[Validators.email()]"
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
    label: { type: String, required: false, default: "form.ui.email" },
    // The name to use to identify the value
    name: { type: String, required: false, default: "email" },
});

// Value model
const model = defineModel();
</script>
