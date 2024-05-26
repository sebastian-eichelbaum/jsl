<template>
    <div>
        <Link tab unstyled :href="appConfig.urls.legal.dataPrivacy" class="text-justify text-body-2" :style="style">{{
            $t("common.ui.dataPrivacy")
        }}</Link>
        <span :style="style">|</span>
        <Link tab unstyled :href="appConfig.urls.legal.imprint" class="text-justify text-body-2" :style="style">{{
            $t("common.ui.imprint")
        }}</Link>
        <span :style="style">|</span>
        <Link
            tab
            unstyled
            :href="appConfig.urls.legal.termsAndConditions"
            class="text-justify text-body-2"
            :style="style"
            >{{ $t("common.ui.termsAndConditions") }}</Link
        >
    </div>
</template>

<script setup>
import { computed } from "vue";

import Link from "jsl/components/Link.vue";

import { appConfig } from "jsl/AppConfig";

// Text color as prop?
const props = defineProps({
    color: { type: String, required: false, default: "#999" },
});

const style = computed({
    get() {
        return "color: " + props.color + ";";
    },
});
</script>
