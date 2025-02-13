<template>
    <v-avatar :color="avatarColor">
        <span class="text-body-1">{{ avatarInitials }}</span>
    </v-avatar>
</template>

<script setup>
import { computed } from "vue";

import { initials, color } from "jsl/utils/Avatar";

const props = defineProps({
    // The user name
    name: { type: String, default: "" },

    // Color saturation and lightness. Use those to define how intense the color should be.
    saturation: { type: Number, default: 85 },
    lightness: { type: Number, default: 65 },
});

const avatarInitials = computed(() => {
    return initials(props.name);
});

const avatarColor = computed(() => {
    return color(props.name, props.saturation, props.lightness);
});
</script>

<style scoped></style>
