<!--
Show a panel with app logo, legal info and more while loading a project.
-->
<template>
    <Panel class="pl-5 pr-5" fillHeight footerJustify="end" v-bind="{ ...$props, ...$attrs }">
        <template #header>
            <slot name="prependHeader"> </slot>
            <AppLogo
                v-if="!noAppLogo && appLogoLocation == 'header'"
                class="mb-2 mt-5"
                width="512px"
                height="auto"
                max-width="75vw"
            />
            <p v-if="!noAppLogo && appLogoLocation == 'header'" class="text-center testy">
                {{ tt(subtitle) }}
            </p>
            <LanguageButton
                v-if="langButton && langButtonLocation == 'header'"
                :iconOnly="false"
                rounded
                class="ma-10 mb-10"
            />
            <slot name="appendHeader"> </slot>
        </template>

        <v-img
            v-if="_logo"
            :height="logoHeight"
            :width="logoWidth"
            :src="_logo"
            max-width="55vw"
            max-height="55vw"
            style="flex-grow: 0"
            class="mb-5"
        />
        <p v-if="title != null" class="mb-5 text-center shrink_h">
            {{ tt(title) }}
        </p>
        <p v-if="subtitle != null" class="mb-5 text-center-justify shrink_body">
            {{ tt(subtitle) }}
        </p>

        <Busy busy :percent="loadPerc" :indeterminate="pending" />

        <template #footer>
            <LanguageButton
                v-if="langButton && langButtonLocation == 'footer'"
                :iconOnly="false"
                icon="mdi-translate"
                rounded
                class="ma-5 mb-10"
            />
            <AppLogo
                v-if="!noAppLogo && appLogoLocation == 'footer'"
                class="mb-2 mt-5"
                width="200px"
                height="auto"
                max-width="75vw"
            />
            <MadeByCompany />
            <LegalLinks class="mb-2" />
        </template>
    </Panel>
</template>

<script setup>
import { ref, computed } from "vue";
import { useDisplay } from "vuetify";

import { tt, Translatable, TranslatedString } from "jsl/Localization";

import Busy from "jsl/components/utils/Busy.vue";
import Panel from "jsl/components/Panel.vue";
import MadeByCompany from "jsl/components/MadeByCompany.vue";
import LegalLinks from "jsl/components/LegalLinks.vue";
import LanguageButton from "jsl/components/i18n/LanguageButton.vue";
import AppLogo from "jsl/components/AppLogo.vue";

const props = defineProps({
    // Title of the loading project
    title: { type: [String, Translatable], required: false, default: null },

    // A subtitle
    subtitle: { type: [String, Translatable], required: false, default: null },

    // A logo to show above the title
    logo: { default: null },

    // Logo sizing
    logoWidth: { default: "300px" },
    // Logo sizing
    logoHeight: { default: "300px" },

    // If the given logo is falsy, show this instead. If this is also null, do not show any logo if no logo is given.
    defaultLogo: { default: null },

    // When pending is false and this is >=0, use this as percentage
    percent: { type: Number, default: -1 },

    // When true, the busy spinner will be indeterminate
    pending: { type: Boolean, default: false },

    // Where to place the lang button?
    langButtonLocation: { type: String, default: "footer" },
    // Hide lang buttons?
    langButton: { type: Boolean, default: false },

    // Where to place the AppLogo? "header", "footer"
    appLogoLocation: { type: String, default: "footer" },

    // Hide logos?
    noAppLogo: { type: Boolean, default: false },
});

const _logo = computed(() => {
    return props.logo ?? props.defaultLogo;
});

const loadPerc = computed(() => {
    if (props.percent == null) {
        return -1;
    }
    return props.percent;
});
</script>

<style scoped>
.shrink_h {
    font-size: min(2.1rem, 6vw);
}

.shrink_body {
    font-size: min(1rem, 5vw);
}
</style>
