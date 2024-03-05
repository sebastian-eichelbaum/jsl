<!--
A card that shows a big shopping icon and opens the shop URL on click
-->
<template>
    <ActionCard v-bind="{ ...$props, ...$attrs }" :href="appConfig.urls.shop"/>
</template>

<script setup>
import { computed } from "vue";

import ActionCard from "@jsl/components/cards/ActionCard.vue";

import { appConfig } from "@jsl/AppConfig";

const props = defineProps({
    // The icon to show
    icon: { type: String, default: "mdi-shopping-outline" },

    // ... and the ActionCard props.
});

</script>

<style scoped></style>
