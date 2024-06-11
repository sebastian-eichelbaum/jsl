<!-- 
A utility component that manages the initial overlay. Use this in your app component to fade out the init overlay once
the app gets mounted.
-->

<template></template>

<script setup>
import { onMounted } from "vue";

import InitOverlay from "jsl/InitOverlay";

onMounted(() => {
    InitOverlay.delayedHide(props.delay);
});

const props = defineProps({
    delay: { required: false, default: 250 },
});
</script>
