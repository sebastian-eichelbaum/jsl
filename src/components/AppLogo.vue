<!--
Displays the app logo.

* If an HTML override is given, it will be used. (see AppConfig.logos.appHTML/appCompactHTML.
* If no AppConfig.urls.app is given and no explicit href prop is set, the link is disabled.
-->

<template>
    <Link :href="_href" tab :disabled="disabled" unstyled @click="onClick" :clickOnly="clickOnly" class="LogoLink">
        <span v-if="asHTMLOverride" class="htmlLogo">
            <span v-html="asHTMLOverride" :style="{ 'font-size': textSize + 'rem' }" />
        </span>
        <span v-else class="imgLogo">
            <v-img
                v-if="compact"
                :height="appConfig.logos.appCompact?.height || height"
                :width="appConfig.logos.appCompact?.width || width"
                :max-width="maxWidth"
                :max-height="maxHeight"
                position="0% 50%"
                inline
                :src="appConfig.logos.appCompact?.url || appConfig.logos.appCompact"
            ></v-img>
            <v-img
                v-else
                :height="appConfig.logos.app?.height || height"
                :width="appConfig.logos.app?.width || width"
                :max-width="maxWidth"
                :max-height="maxHeight"
                :src="appConfig.logos.app?.url || appConfig.logos.app"
            ></v-img>
        </span>
        <span
            v-if="_version && showVersion"
            class="text-caption font-weight-light versionBaselineShift"
            style="color: rgba(255, 255, 255, 0.3)"
            >{{ _version }}</span
        >
    </Link>
</template>

<script setup>
import { computed } from "vue";

import { appConfig } from "jsl/AppConfig";
import Link from "jsl/components/Link.vue";

const props = defineProps({
    // Text size override for html logos (if AppConfig logos.appHTML/appCompactHTML is defined).
    textSize: { type: String, required: false, default: "1.5" },
    // Force the logo to be compact
    compact: { type: Boolean, required: false, default: false },
    // Disable the link around the logo
    disabled: { type: Boolean, required: false, default: false },
    // Allows to override the link referred to when clicking the logo. If unset, the AppConfig app url is used.
    href: { type: String, required: false, default: null },

    // Maximum width/height. Allows to limit the logo size while using the max possible space.
    maxWidth: { type: [String, Number], required: false, default: undefined },
    // Maximum width/height. Allows to limit the logo size while using the max possible space.
    maxHeight: { type: [String, Number], required: false, default: undefined },

    // If true, clicking the logo does not trigger the href link. Only click is emitted.
    clickOnly: { type: Boolean, required: false, default: false },

    // If the images are used, these define width and height (behaves like max width/height in v-img)
    width: { type: [String, Number], required: false, default: "200" },
    // The height of the AppLogo
    height: { type: [String, Number], required: false, default: "64" },

    // A nice version text to show, or null if the AppConfig.version should be used.
    version: { type: String, default: null },

    // Disable version display
    showVersion: { type: Boolean, default: false },
});

const _href = computed(() => {
    return props.href || appConfig.urls.app || ""; // NOTE: if both are nullish, the link is disabled
});

const _version = computed(() => {
    return props.version || appConfig.version;
});

const versionBaselineShift = computed(() => {
    if (props.compact) {
        return appConfig.logos.appCompact?.baselineShift || "0";
    }
    return appConfig.logos.app?.baselineShift || "0";
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

<style scoped>
.LogoLink {
    display: flex;
    height: v-bind("height");
    margin: 0;
    padding: 0;
    align-items: center;
    justify-content: center;
}

.versionBaselineShift {
    padding-bottom: v-bind("versionBaselineShift");
    display: block;
    align-self: end;
}

.htmlLogo {
    align-self: end;
}

.imgLogo {
    align-self: start;
    height: v-bind("height");
}
</style>
