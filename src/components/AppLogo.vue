<!--
Displays the app logo.

* If an HTML override is given, it will be used. (see AppConfig.logos.appHTML/appCompactHTML.
* If no AppConfig.urls.app is given and no explicit href prop is set, the link is disabled.
-->

<template>
    <Link
        :href="_href"
        tab
        :disabled="disabled"
        unstyled
        @click="onClick"
        :clickOnly="clickOnly"
        class="LogoLink"
        :class="{ flexColumn: column }"
    >
        <span v-if="showPoweredBy" class="font-weight-light" style="color: #aaa" :style="{ 'font-size': size + 'rem' }">
            {{ tt(poweredByText) }}
        </span>
        <span v-if="asHTMLOverride" class="htmlLogo">
            <span v-html="asHTMLOverride" :style="{ 'font-size': textSize + 'rem' }" />
        </span>
        <span v-else class="imgLogo">
            <v-img
                v-if="compact"
                :height="_height"
                :width="_width"
                :max-width="maxWidth"
                :max-height="maxHeight"
                :position="position ?? '0% 50%'"
                :src="appConfig.logos.appCompact?.url || appConfig.logos.appCompact"
            ></v-img>
            <v-img
                v-else
                :height="_height"
                :width="_width"
                :max-width="maxWidth"
                :max-height="maxHeight"
                :position="position"
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

import { tt, Translatable } from "jsl/Localization";

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

    // If set, the elements of the logo (poweredBy text, logo) are shown as columns instead of in line.
    column: { type: Boolean, default: false },

    // Maximum width/height. Allows to limit the logo size while using the max possible space.
    maxWidth: { type: [String, Number], required: false, default: undefined },
    // Maximum width/height. Allows to limit the logo size while using the max possible space.
    maxHeight: { type: [String, Number], required: false, default: undefined },

    // If true, clicking the logo does not trigger the href link. Only click is emitted.
    clickOnly: { type: Boolean, required: false, default: false },

    // If the images are used, these define width and height - there are some magic values:
    //  * "auto" or nullish - do not set any size to v-img.
    //  * "src" - use the size given in AppConfig.logos.[compact].width/height. If not defined, do not set any size.
    //  * "src:256px" - like src, but if not defined, use the value after ":" as fallback.
    //  * anything else - set this value
    //
    // Use maxWidth/maxHeight to constrain sizes.
    width: { type: [String, Number], required: false, default: "src:200px" },
    // The height of the AppLogo - see width for details
    height: { type: [String, Number], required: false, default: "src:64px" },

    // Set the css object-position prop. This allows to align the image inside its container. By default, it is aligned
    // center center. To get an image to the left while centering vertically, set "left center"
    //
    // If "compact" is set, this defaults to "left center", "center center" else.
    position: { type: String, default: undefined },

    // A nice version text to show, or null if the AppConfig.version should be used.
    version: { type: String, default: null },

    // Disable version display
    showVersion: { type: Boolean, default: false },

    // Show a "powered by"- text?
    showPoweredBy: { type: Boolean, default: false },
    // The text
    poweredByText: { type: [String, Translatable], default: tt("common.msg.poweredBy") },
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

function calcSize(prop, src) {
    if (prop === "auto" || prop == null) {
        return undefined;
    }

    if (prop.startsWith("src")) {
        console.log(src, prop.slice(4));
        const r = src ?? (prop.slice(4) || undefined);
        console.log(r);
        return r;
    }

    return prop;
}

const _width = computed(() => {
    return calcSize(props.width, props.compact ? appConfig?.logos?.appCompact?.width : appConfig?.logos?.app?.width);
});

const _height = computed(() => {
    return calcSize(props.height, props.compact ? appConfig?.logos?.appCompact?.height : appConfig?.logos?.app?.height);
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
    height: v-bind("_height");
    margin: 0;
    padding: 0;
    align-items: center;
    justify-content: center;
}

.flexColumn {
    flex-direction: column;
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
    height: v-bind("_height");
}
</style>
