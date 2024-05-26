<!--
A simple hint you can use to convey developer notes to users.
-->
<template>
    <v-alert type="warning" variant="outlined" prominent border="start" class="mb-5 mt-5">
        <b>{{ tt(title) }}</b> <slot></slot>
    </v-alert>
</template>

<script setup>
import { tt, Translatable } from "jsl/Localization";

const props = defineProps({
    title: { type: [String, Translatable], default: tt("common.msg.devhint") },
});
</script>
