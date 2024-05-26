<template>
    <Button
        type="submit"
        v-bind="{ ...$props, ...$attrs }"
    />
</template>

<script setup>
import { ref } from "vue";

import { localization } from "jsl/Localization";
import Button from "jsl/components/Button.vue";

const props = defineProps({
    // Button icon. Only used if not text is given
    icon: { type: String, default: "mdi-arrow-right-thin" },
    // Button color
    color: { type: String, default: "primary" },
    // Button text. Hides the icon if not empty. Use prepend-icon or append-icon if an icon is needed
    text: { type: String, default: null },
    // A rounded value that v-btn supports
    rounded: { type: String, default: "xl" },
    // A size value that v-btn supports
    size: { type: String, default: "large" },
    // Button variant. Submit buttons should be highlighted
    variant: { default: "flat" },

    // If true, the button is indicating a busy state and is disabled
    loading: { type: Boolean, default: false },

    // If true, the button is disabled
    disabled: { type: Boolean, default: false },

    // The self justify property if this is used in a grid or flex
    justifySelf: { type: String, default: "unset" },
    // The self align property if this is used in a grid or flex
    alignSelf: { type: String, default: "unset" },
});
</script>
