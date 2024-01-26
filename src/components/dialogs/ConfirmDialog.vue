<template>
    <ModalDialog v-model="model" width="auto" v-bind="{ ...$props, ...$attrs }" @close="onNo">
        <v-card-title :style="titleStyle">
            <slot>{{ tt(title) }}</slot>
        </v-card-title>
        <v-card-text>
            <slot>{{ tt(subtitle) }}</slot>
        </v-card-text>
        <v-card-actions>
            <v-spacer v-if="spacer.l"></v-spacer>
            <v-btn :color="noColor" :variant="noVariant" @click="onNo">{{ $t(no) }}</v-btn>
            <v-spacer v-if="spacer.c"></v-spacer>
            <v-btn :color="yesColor" :variant="yesVariant" @click="onYes">{{ $t(yes) }}</v-btn>
            <v-spacer v-if="spacer.r"></v-spacer>
        </v-card-actions>
    </ModalDialog>
</template>

<script setup>
import { computed } from "vue";

import { tt, Translatable } from "@jsl/Localization";

import { makeBackgroundStyle, computedBackgroundStyle, makeBackgroundStyleProps } from "@jsl/utils/Style";

import ModalDialog from "@jsl/components/dialogs/ModalDialog.vue";

const model = defineModel();

const props = defineProps({
    // Dialog Title
    title: { type: [String, Translatable], default: tt("common.prompt.areYouSure") },
    // Dialog Subtitle
    subtitle: { type: [String, Translatable], default: tt("common.msg.unsavedChangesWillBeLost") },

    // generate blur, color, alpha, brightness props
    ...makeBackgroundStyleProps("titleBackground", { color: "surface", alpha: 0.0, brightness: 0.75, blur: 0 }),

    // Yes text
    yes: { type: String, required: false, default: "common.ui.yes" },
    // No text
    no: { type: String, required: false, default: "common.ui.no" },

    // Yes Button variant
    yesVariant: { type: String, required: false, default: "flat" },
    // No Button variant
    noVariant: { type: String, required: false, default: "tonal" },

    // Color of the yes button
    yesColor: { type: String, required: false, default: "primary" },
    // Color of the no button
    noColor: { type: String, required: false, default: "" },

    // Button spacing variant: evenly, split, center, left, right
    variant: { type: String, required: false, default: "center" },
});

const spacer = computed(() => {
    switch (props.variant) {
        case "evenly":
            return { l: true, c: true, r: true };
        case "split":
            return { l: false, c: true, r: false };
        case "center":
            return { l: true, c: false, r: true };
        case "left":
            return { l: false, c: false, r: true }; ///same as false false false
        case "right":
            return { l: true, c: false, r: false };
    }
    // Same as evenly
    return { l: true, c: true, r: true };
});

const titleStyle = computedBackgroundStyle(props, "titleBackground");

const emit = defineEmits(["yes", "no"]);

const onYes = () => {
    model.value = false;
    emit("yes");
};

const onNo = () => {
    model.value = false;
    emit("no");
};
</script>
