<template>
    <Link :href="_href" tab :disabled="nolink" unstyled>
        <span v-if="text">
            <span v-html="appName" :style="{ 'font-size': textSize + 'rem' }" />
        </span>
        <span v-else>
            <v-img v-if="oneline" max-width="200px" cover :src="appConfig.logos.appCompact"></v-img>
            <v-img v-else :max-width="imgMaxWidth" cover :src="appConfig.logos.app"></v-img>
        </span>
    </Link>
</template>

<script setup>
import { computed } from "vue";

import { appConfig } from "@jsl/AppConfig";
import Link from "@jsl/components/Link.vue";

const props = defineProps({
    imgMaxWidth: { type: String, required: false, default: "200px" },
    // Text size
    textSize: { type: String, required: false, default: "1.5" },
    // Force the logo to be a compact one-liner
    oneline: { type: Boolean, required: false, default: false },
    // Force the logo to consist of text only
    text: { type: Boolean, required: false, default: false },
    // Disable the link around the logo
    nolink: { type: Boolean, required: false, default: false },
    // Allows to override the link referred to when clicking the logo. If unset, the AppConfig app url is used.
    href: { type: String, required: false, default: null },
});

const _href = computed(() => {
    return props.href ?? appConfig.urls.app;
});

const appName = computed({
    get() {
        if (props.oneline) {
            return appConfig.logos.appCompactHTML || appConfig.name;
        }
        if (!props.oneline) {
            return appConfig.logos.appHTML || appConfig.name;
        }
    },
});
</script>
