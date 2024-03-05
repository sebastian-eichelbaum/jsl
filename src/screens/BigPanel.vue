<!-- 
A modern screen with panel and background. It provides a logo, a center UI slot, all the legal stuff and a language selection.
Ideal for welcome/auth screens

It provides a named slots:
* header: the top area - filled with AppLogo by default
* footer: the top area - filled with the Legal, MadeBy and LanguageSwitch
* unnamed slot: the center area - 

Example:
import myImage from "@assets/myImage.png";
...
<BigPanel :background="{image: myImage, blur: '5px', ... // all props from Background.vue}">
    <template v-slot:header>
        Header
    </template>
    Main
    <template v-slot:footer>
        Footer
    </template>
</BigPanel>
-->

<template>
    <Background v-bind="fwdBindProps('background', $props, { alpha: '0.0', blur: '0px', image: DefaultBackground })">
        <v-container class="fill-height ma-0 pa-0" fluid>
            <v-row class="fill-height" no-gutters>
                <v-col xs="12" md="4" cols="12">
                    <v-sheet
                        class="fill-height pa-7 jsl-bgBlur-30 jsl-bgAlpha-background-30"
                        :maxWidth="xs ? '100000px' : maxWidth"
                        elevation="5"
                    >
                        <v-row no-gutters class="fill-height">
                            <v-col cols="12" align-self="start" :align="headerAlign" class="mb-3">
                                <slot name="headers">
                                    <AppLogo />
                                </slot>
                            </v-col>
                            <v-col cols="12" align-self="center" :align="bodyAlign">
                                <slot> Place Main Content Here </slot>
                            </v-col>

                            <v-col cols="12" :align="footerAlign" align-self="end" class="mt-3">
                                <slot name="footer">
                                    <LanguageButton :hideText="false" rounded class="ma-5 mb-10" v-if="!hideLanguage" />
                                    <MadeByCompany v-if="!hideMadeBy" />
                                    <LegalLinks v-if="!hideLegal" />
                                </slot>
                            </v-col>
                        </v-row>
                    </v-sheet>
                </v-col>
            </v-row>
        </v-container>
    </Background>
</template>

<script setup>
import { ref, computed } from "vue";
import { useDisplay } from "vuetify";

import { appConfig } from "@jsl/AppConfig";

import DefaultBackground from "@jslassets/DefaultBackground.webp";
import Background from "@jsl/components/Background.vue";

import AppLogo from "@jsl/components/AppLogo.vue";

import LanguageButton from "@jsl/components/i18n/LanguageButton.vue";
import MadeByCompany from "@jsl/components/MadeByCompany.vue";
import LegalLinks from "@jsl/components/LegalLinks.vue";

import { fwdProps, fwdBindProps } from "@jsl/utils/ForwardVueProps";

const { xs, mdAndUp } = useDisplay();

const props = defineProps({
    // Forward some component props. (As Background Style props as in Style.js)
    ...fwdProps("background"),

    // Hide the language switch?
    hideLanguage: { type: Boolean, required: false, default: false },
    // Hide the legal links?
    hideLegal: { type: Boolean, required: false, default: false },
    // Hide the MadeBy thingy?
    hideMadeBy: { type: Boolean, required: false, default: false },

    // Max with
    maxWidth: { type: String, required: false, default: "400px" },

    // Alignment of the header contents
    headerAlign: { type: String, required: false, default: "center" },

    // Alignment of the  body contents
    bodyAlign: { type: String, required: false, default: "start" },

    // Alignment of the footer contents
    footerAlign: { type: String, required: false, default: "center" },
});
</script>

<style scoped></style>
