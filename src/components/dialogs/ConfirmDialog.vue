<template>
    <ModalDialog v-model="model" width="auto" v-bind="{ ...$props, ...$attrs }" @close="onNo">
        <v-card-text>
            <slot>{{ $t("common.prompt.areYouSure") }}</slot>
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

import ModalDialog from "@jsl/components/dialogs/ModalDialog.vue";

const model = defineModel();

const props = defineProps({
    yes: { type: String, required: false, default: "common.ui.yes" },
    no: { type: String, required: false, default: "common.ui.no" },

    yesVariant: { type: String, required: false, default: "flat" },
    noVariant: { type: String, required: false, default: "tonal" },

    yesColor: { type: String, required: false, default: "primary" },
    noColor: { type: String, required: false, default: "" },

    variant: { type: String, required: false, default: "evenly" },
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
