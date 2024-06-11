<template>
    <ConfirmDialog v-bind="{ ...$props, ...$attrs }" v-model="dialogModel" @yes="onYes">
        <slot />
    </ConfirmDialog>
</template>

<script setup>
import { onMounted } from "vue";

import ConfirmDialog from "jsl/components/dialogs/ConfirmDialog.vue";

import { tt, Translatable } from "jsl/Localization";
import { platform } from "jsl/Platform";

const props = defineProps({
    title: { type: [String, Translatable], default: tt("common.prompt.areYouSure") },
    subtitle: { type: [String, Translatable], default: tt("common.msg.unsavedChangesWillBeLost") },

    // If this is true, this Dialog will handle the Platform.onClose event. This has to be true on onMounted.
    handleWindowClose: { type: Boolean, default: false },
});

const dialogModel = defineModel();

const emits = defineEmits(["yes"]);

onMounted(() => {
    if (!props.handleWindowClose) {
        return;
    }

    platform.onClose = () => {
        dialogModel.value = true;
    };
});

function onYes() {
    if (props.handleWindowClose) {
        platform.windowClose(true);
    }
    emit("yes");
}
</script>
