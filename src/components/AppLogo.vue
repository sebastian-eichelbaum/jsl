<!--
Displays the app logo. 

* If an HTML override is given, it will be used. (see AppConfig.logos.appHTML/appCompactHTML.
* If no AppConfig.urls.app is given and no explicit href prop is set, the link is disabled.
-->

<template>
    <Link :href="_href" tab :disabled="disabled" unstyled @click="onClick" :clickOnly="clickOnly">
        <span v-if="asHTMLOverride">
            <span v-html="asHTMLOverride" :style="{ 'font-size': textSize + 'rem' }" />
        </span>
        <span v-else>
            <v-img v-if="compact" max-width="200px" cover :src="appConfig.logos.appCompact"></v-img>
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
    // Text size override for html logos (if AppConfig logos.appHTML/appCompactHTML is defined).
    textSize: { type: String, required: false, default: "1.5" },
    // Force the logo to be compact
    compact: { type: Boolean, required: false, default: false },
    // Disable the link around the logo
    disabled: { type: Boolean, required: false, default: false },
    // Allows to override the link referred to when clicking the logo. If unset, the AppConfig app url is used.
    href: { type: String, required: false, default: null },

    // If true, clicking the logo does not trigger the href link. Only click is emitted.
    clickOnly: { type: Boolean, required: false, default: false },
});

const _href = computed(() => {
    return props.href || appConfig.urls.app || ""; // NOTE: if both are nullish, the link is disabled
});

const asHTMLOverride = computed(() => {
    if (props.compact) {
        return appConfig.logos.appCompactHTML;
    }
    if (!props.compact) {
        return appConfig.logos.appHTML;
    }
});

const emit = defineEmits([
    // Emitted when clicking on the logo. NOT Emitted if disabled is true
    "click",
]);

function onClick() {
    emit("click");
}
</script>
