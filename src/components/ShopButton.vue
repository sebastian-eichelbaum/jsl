<template>
    <LinkButton icon="mdi-shopping" :href="appConfig.urls.shop" v-bind="$props">
        <slot>{{ $t("common.ui.shop") }}</slot>
    </LinkButton>
</template>

<script setup>
import LinkButton from "@jsl/components/LinkButton.vue";

import { platform } from "@jsl/Platform";
import { appConfig } from "@jsl/AppConfig";

// Handle Clicks
function onClick() {
    //Platform.openLink(AppConf.companyShop, true);
}
</script>

<style scoped></style>
