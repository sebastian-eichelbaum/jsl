<!--
Provides a button that opens the shop iff appConfig.urls.shop is not nullish.
-->
<template>
    <LinkButton v-if="appConfig.urls.shop" :href="appConfig.urls.shop" v-bind="{ ...$props, ...$attrs }">
        <slot />
    </LinkButton>
</template>

<script setup>
import LinkButton from "@jsl/components/LinkButton.vue";

import { platform } from "@jsl/Platform";
import { tt } from "@jsl/Localization";
import { appConfig } from "@jsl/AppConfig";

// Handle Clicks
function onClick() {
    //Platform.openLink(AppConf.companyShop, true);
}

const props = defineProps({
    text: { default: tt("common.ui.shop") },
    rounded: { default: "xl" },
    icon: { default: "mdi-shopping" },
    color: { default: "primary" },
    maxWidth: { default: null },
});
</script>

<style scoped></style>
