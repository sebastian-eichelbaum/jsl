<template>
    <v-list-item v-for="(item, index) in localization.locales" :key="item.iso" :value="item.iso">
        <v-list-item-title>{{ item.name }}</v-list-item-title>
    </v-list-item>
</template>

<script setup>
import { localization } from "jsl/Localization";
</script>
