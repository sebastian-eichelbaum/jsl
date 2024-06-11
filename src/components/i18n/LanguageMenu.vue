<template>
    <v-menu activator="parent">
        <v-list v-model:selected="selected" :density="compact ? 'compact' : 'default'">
            <LanguageListItems />
        </v-list>
    </v-menu>
</template>

<script setup>
import { localization } from "jsl/Localization";

import LanguageListItems from "jsl/components/i18n/LanguageListItems.vue";

import { computed } from "vue";

const selected = computed({
    get() {
        return [localization.localeIso];
    },
    set(value) {
        localization.locale = value[0];
    },
});

const props = defineProps({
    compact: { type: Boolean, required: false, default: false },
});
</script>
