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
            <slot>{{ tt("common.msg.todo", { what: "Field Slot!" }) }}</slot>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, computed } from "vue";

import { tt, Translatable } from "@jsl/Localization";

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
});
</script>
