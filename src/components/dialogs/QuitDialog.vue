<template>
    <ConfirmDialog v-bind="{ ...$props, ...$attrs }">
        <slot>{{ $t("common.prompt.areYouSureToQuit") }}</slot>
    </ConfirmDialog>
</template>

<script setup>
import ConfirmDialog from "@jsl/components/dialogs/ConfirmDialog.vue";
</script>
