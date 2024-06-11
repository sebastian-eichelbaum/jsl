<template>
    <div>
        <span class="font-weight-light" style="color: #888" :style="{ 'font-size': size + 'rem' }"
            >Made by
        </span>
        <Link tab unstyled :href="appConfig.urls.company">
            <span class="font-weight-bold" :style="{ 'font-size': size + 'rem' }">{{
                appConfig.company
            }}</span>
        </Link>
    </div>
</template>

<script setup>
import Link from "jsl/components/Link.vue";

import { appConfig } from "jsl/AppConfig";

const props = defineProps({
    size: { type: Number, required: false, default: 1 },
});
</script>
