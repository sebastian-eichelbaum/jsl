<!--
Provides a button that opens the shop iff appConfig.urls.shop is not nullish.
-->
<template>
    <LinkButton
        v-if="appConfig.urls.shop"
        :href="appConfig.urls.shop"
        :hideText="smAndDown"
        v-bind="{ ...$props, ...$attrs }"
    >
        <slot />
    </LinkButton>
</template>

<script setup>
import { useDisplay } from "vuetify";

import LinkButton from "@jsl/components/LinkButton.vue";

import { tt } from "@jsl/Localization";
import { appConfig } from "@jsl/AppConfig";

const props = defineProps({
    text: { default: tt("common.ui.shop") },
    rounded: { default: "xl" },
    icon: { default: "mdi-shopping" },
    color: { default: "primary" },
    maxWidth: { default: null },
});

const { smAndDown } = useDisplay();
</script>

<style scoped></style>
