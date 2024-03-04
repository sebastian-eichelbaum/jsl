<!--
Different impl for different transitions. More testing is needed. Some transitions do not work well with full size
content.
-->

<template>
    <v-fade-transition mode="out-in" v-if="transition == 'v-fade-transition'">
        <span v-for="item in slotSel" :key="item" :style="innerStyle" :class="innerClass">
            <slot :name="item" />
        </span>
    </v-fade-transition>
    <component v-else :is="transition" leave-absolute>
        <span v-for="item in slotSel" :key="item" :style="innerStyle" :class="innerClass">
            <slot :name="item" />
        </span>
    </component>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    selected: { type: String, required: false, default: null },
    // See https://vuetifyjs.com/en/styles/transitions/
    transition: { type: String, required: false, default: "v-fade-transition" },

    innerStyle: { default: "" },
    innerClass: { default: "" },
});

const slotSel = computed({
    get() {
        return [props.selected];
    },
});
</script>
