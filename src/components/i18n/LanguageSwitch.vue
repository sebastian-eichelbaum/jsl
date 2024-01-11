<template>
    <v-btn :variant="variant" :rounded="rounded ? 'xl' : '0'" :prepend-icon="icon">
        {{ localization.localeName }}

        <LanguageMenu compact />
    </v-btn>
</template>

<script setup>
import { localization } from "@jsl/Localization";

import LanguageMenu from "@jsl/components/i18n/LanguageMenu.vue";

const props = defineProps({
    variant: { type: String, required: false, default: "tonal" },
    rounded: { type: Boolean, required: false, default: false },
    icon: { type: String, required: false, default: "mdi-web" },
});
</script>
