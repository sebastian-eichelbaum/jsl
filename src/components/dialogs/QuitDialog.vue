<template>
    <ConfirmDialog v-bind="{ ...$props, ...$attrs }">
        <slot/>
    </ConfirmDialog>
</template>

<script setup>
import ConfirmDialog from "@jsl/components/dialogs/ConfirmDialog.vue";

import { tt, Translatable } from "@jsl/Localization";

const props = defineProps({
    title: { type: [String, Translatable], default: tt("common.prompt.areYouSure") },
    subtitle: { type: [String, Translatable], default: tt("common.msg.unsavedChangesWillBeLost") },
});


</script>
