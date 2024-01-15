<!--
A flexible main screen default.

* The anonymous slot is the actual content
-->

<template>
    <Background v-bind="fwd_background" v-if="useBackground">
        <v-container fluid :class="{ 'fill-height': fillHeight }">
            <slot>TODO: fill </slot>
        </v-container>
    </Background>
    <v-container fluid :class="{ 'fill-height': fillHeight }" v-else>
        <slot>TODO: fill </slot>
    </v-container>
</template>

<script setup>
import { ref, reactive } from "vue";

import { fwdProps } from "@jsl/utils/ForwardVueProps";

import Background from "@jsl/components/Background.vue";

const props = defineProps({
    // Forward all those nested component props
    ...fwdProps("background", { blur: "40px", alpha: "0.1" }),

    // Enable the nice background? If not, the content is drawn directly
    useBackground: { type: Boolean, default: false },

    // fill height? This forces the container to be full height, but flex content is centered by default.
    // In most situations, this is not recommended
    fillHeight: { type: Boolean, default: false },
});
</script>
