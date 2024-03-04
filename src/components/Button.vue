<!--
A convenient wrapper around v-btn. It provides some more useful defaults like 

* uniform icon handling using a single icon property,
* automatically ellipsized text
* max width 
* automatic translation of text in the text property 

-->

<template>
    <v-btn
        v-bind="{ ...$props, ...$attrs }"
        :prepend-icon="icon"
        :icon="!withText"
        :style="{ 'justify-self': justifySelf, 'align-self': alignSelf }"
        :text="undefined"
    >
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
    if (props.maxWidth != null && props.icon != null) {
        return "max-width: calc(" + props.maxWidth + " - 50px);";
    }
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

    // The self justify property if this is used in a grid or flex
    justifySelf: { type: String, required: false, default: "unset" },
    // The self align property if this is used in a grid or flex
    alignSelf: { type: String, required: false, default: "unset" },
});
</script>
