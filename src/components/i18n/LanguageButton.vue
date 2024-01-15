<template>
    <Button v-bind="{ ...$props, ...$attrs }" :text="localization.localeName">
        <LanguageMenu compact />
    </Button>
</template>

<script setup>
import { ref, computed } from "vue";

import { localization } from "@jsl/Localization";

import LanguageMenu from "@jsl/components/i18n/LanguageMenu.vue";
import Button from "@jsl/components/Button.vue";

const props = defineProps({
    icon: { type: String, required: false, default: "mdi-web" },

    // + Props of jsl/components/Button.vue
});
</script>
