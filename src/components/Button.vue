<!--
A convenient wrapper around v-btn. It provides some more useful defaults like 

* uniform icon handling using a single icon property,
* automatically ellipsized text
* max width 
* automatic translation of text in the text property 

-->

<template>
    <v-btn :variant="variant" :rounded="rounded" :prepend-icon="icon" :icon="!withText">
        <v-icon v-if="!withText">{{ icon }}</v-icon>

        <span v-if="withText" :style="maxWidthStyle" class="text-truncate">
            {{ tt(text) }}
        </span>

        <slot />
    </v-btn>
</template>

<script setup>
import { computed } from "vue";

import { tt } from "@jsl/Localization";

const maxWidthStyle = computed(() => {
    return props.maxWidth ? "max-width: " + props.maxWidth : "";
});

const withText = computed(() => {
    return !props.hideText && props.text;
});

const props = defineProps({
    variant: { default: "tonal" },
    rounded: { default: "regular" },
    icon: { default: undefined },
    text: { default: "" },
    hideText: { type: Boolean, default: false },

    // Limit the width. Longer texts are shortened using a "..." ellipsis
    maxWidth: { default: null /* 100px */ },
});
</script>
