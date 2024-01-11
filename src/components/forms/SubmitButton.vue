<template>
    <v-btn
        :disabled="disabled"
        type="submit"
        :color="color"
        :icon="text ? null : icon"
        :text="text"
        :rounded="rounded"
        :size="size"
        :loading="loading"
    />
</template>

<script setup>
import { ref } from "vue";

import { localization } from "@jsl/Localization";

const props = defineProps({
    // Button icon. Only used if not text is given
    icon: { type: String, required: false, default: "mdi-arrow-right-thin" },
    // Button color
    color: { type: String, required: false, default: "primary" },
    // Button text. Hides the icon if not empty. Use prepend-icon or append-icon if an icon is needed
    text: { type: String, required: false, default: null },
    // A rounded value that v-btn supports
    rounded: { type: String, required: false, default: "xl" },
    // A size value that v-btn supports
    size: { type: String, required: false, default: "large" },

    // If true, the button is indicating a busy state and is disabled
    loading: { type: Boolean, required: false, default: false },

    // If true, the button is disabled
    disabled: { type: Boolean, required: false, default: false },
});
</script>
