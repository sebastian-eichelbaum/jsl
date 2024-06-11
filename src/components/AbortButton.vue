<template>
    <Button v-bind="{ ...$props, ...$attrs }" :variant="variant" :icon="icon" :text="text" @click="askClose"></Button>
    <ConfirmDialog v-model="dialog" @yes="onYes" @no="onNo" :title="dialogTitle" :subtitle="dialogSubtitle">
        <slot />
    </ConfirmDialog>
</template>

<script setup>
import { ref } from "vue";

import { tt, Translatable } from "jsl/Localization";

import Button from "jsl/components/Button.vue";

import ConfirmDialog from "jsl/components/dialogs/ConfirmDialog.vue";

const props = defineProps({
    text: { type: [String, Translatable], default: tt("common.ui.abort") },
    dialogTitle: { type: [String, Translatable], default: tt("common.prompt.areYouSure") },
    dialogSubtitle: { type: [String, Translatable], default: tt("common.msg.unsavedChangesWillBeLost") },

    // Default variant of the button
    variant: { default: "tonal" },

    // Icon used on the button. Can be null to disable
    icon: { default: "mdi-cancel" },

    // If set, the user will not be asked
    doNotAsk: { type: Boolean, default: false },
});

// Yes if abort is requested.
const emit = defineEmits(["yes", "no"]);

// Dialog model
let dialog = ref(false);

// On abort-click - Open the dialog
function askClose() {
    if (props.doNotAsk) {
        onYes();
        return;
    }
    dialog.value = true;
}

const onYes = () => {
    emit("yes");
};

const onNo = () => {
    emit("no");
};
</script>
