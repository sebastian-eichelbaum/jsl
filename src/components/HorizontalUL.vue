<!-- A horizontal unordered list -->
<template>
    <ul class="horizontal">
        <li v-for="(word, i) in words" :key="word" :class="i === 0 ? 'first' : ''">
            {{ tt(word) }}
        </li>
    </ul>
</template>

<script setup>
import { computed } from "vue";
import { tt } from "jsl/Localization";

const props = defineProps({
    // The words to display in the horizontal list. An array of (translatable) strings.
    words: { type: Array, default: () => [] },

    // The separator to use between words. Default is "|".
    separator: { type: String, default: "|" },

    // If set, the first separator is skipped.
    noSkipFirst: { type: Boolean, default: false },
});

const sepString = computed(() => {
    return "'" + props.separator + "'";
});

const firstSepString = computed(() => {
    return props.noSkipFirst ? "'" + props.separator + "'" : "";
});
</script>

<style scoped>
ul.horizontal {
    text-align: center;
    padding: 0 1em 0 1em;
    margin: 1em 0 1em 0;
    list-style-type: none;
}

ul.horizontal li::before {
    display: inline;
    padding-right: 0.6em;
    padding-left: 0.4em;
    font-weight: bold;
    content: v-bind(sepString);
}

ul.horizontal li.first::before {
    content: v-bind(firstSepString);
}

ul.horizontal li {
    margin-right: 0.25em;
    display: inline;
    display: inline-block;
}
</style>
