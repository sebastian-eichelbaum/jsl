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
        :size="size_"
        class="jslBtn"
        :class="{ jslBtnDisabled: disabled, jslBtnSpacing: iconAlignLeft }"
    >
        <v-icon v-if="!withText">{{ icon }}</v-icon>

        <span v-if="withText" :style="maxWidthStyle" class="text-truncate">
            {{ tt(text) }}
        </span>

        <slot />

        <template v-slot:loader v-if="improvedLoader && withText">
            <v-progress-circular
                class="ml-0 mr-2"
                size="16"
                width="2"
                color="white"
                :indeterminate="improvedLoaderValue < 0"
                :model-value="improvedLoaderValue"
            >
            </v-progress-circular>
            <span v-if="withText" :style="maxWidthStyle" class="text-truncate">
                {{ tt(text) }}
            </span>
        </template>
    </v-btn>
</template>

<script setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";

import { tt } from "jsl/Localization";

const maxWidthStyle = computed(() => {
    if (props.maxWidth != null && props.icon != null) {
        return "max-width: calc(" + props.maxWidth + " - 50px);";
    }
    return props.maxWidth ? "max-width: " + props.maxWidth : "";
});

const display = useDisplay();

const withText = computed(() => {
    const isThresholdMet = (threshold) => {
        try {
            switch (threshold) {
                case "xs":
                    return !display.xs.value;
                case "sm":
                    return display.smAndDown.value;
                case "md":
                    return display.mdAndDown.value;
                case "lg":
                    return display.lgAndDown.value;
                case "xl":
                    return display.xlAndDown.value;
                case "xxl":
                    // There is no explicit XXL threshold.
                    return display.xxl.value;
            }
        } catch (e) {
            console.log(e);
        }
        return false;
    };

    // These conditions decide if there should be text or not:
    const hasText = !props.hideText && props.text;
    // Does the user force the icon mode and is there an icon?
    const forcedIcon = props.iconOnly === true && props.icon != null;
    // Is there a iconOnly threshold match? And only if the iconOnly props was not set.
    const forcedIconByThreshold = props.iconOnly == null && isThresholdMet(props.iconOnlyThreshold);

    return hasText && !forcedIcon && !forcedIconByThreshold;
});

const props = defineProps({
    variant: { default: "tonal" },
    rounded: { default: "regular" },
    icon: { default: undefined },
    text: { default: "" },
    hideText: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: undefined },

    // When the button is icon only, use this button size instead of the normal size.
    iconOnlySize: { type: String, default: undefined },
    // Set to true to make the button to be an icon, but only if there is an icon. This property always overrides the
    // iconOnlyThreshold that might be specified.
    iconOnly: { default: undefined },
    // Set a threshold at which the button should switch to icon only mode. Possible values are:
    // xs,sm,md,lg,xl,xxl - unset if this feature should not be used.
    iconOnlyThreshold: { type: String, default: undefined },

    // If set, there will be "spacing-between" the text and icon. This pushes the icon to the left.
    iconAlignLeft: { type: Boolean, default: false },

    improvedLoader: { type: Boolean, default: false },
    improvedLoaderValue: { default: -1 },

    // Limit the width. Longer texts are shortened using a "..." ellipsis
    maxWidth: { default: null /* 100px */ },

    // The self justify property if this is used in a grid or flex
    justifySelf: { type: String, required: false, default: "unset" },
    // The self align property if this is used in a grid or flex
    alignSelf: { type: String, required: false, default: "unset" },
});

const size_ = computed(() => {
    return withText.value
        ? props.size
        : // or
          props.iconOnlySize || props.size;
});
</script>

<style scoped>
.jslBtn {
    transition: opacity 0.5s;
}

.jslBtnDisabled {
    opacity: 0.2;
}

.jslBtnSpacing {
    justify-content: space-between;
}
</style>
