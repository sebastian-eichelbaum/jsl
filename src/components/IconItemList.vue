<!--
A component to display a list of items with icons and texts in a vertical layout. Alignment of text is ensured.
-->
<template>
    <span class="wrapFlex mt-5" :class="maxWidth ? 'fixedMaxWidth' : ''">
        <span class="wrapFlexContent">
            <span v-for="(item, i) in items" :key="items" :class="i === 0 ? 'first' : ''">
                <v-icon>{{ item.icon }}</v-icon>
                <span v-if="item.text" class="text" :class="itemClass" v-html="tt(item.text)" />
                <component v-else :is="item.component" :class="itemClass" v-bind="item.props" />
            </span>
        </span>
    </span>
</template>

<script setup>
import { tt } from "jsl/Localization";

const props = defineProps({
    // Items as an array of objects with "icon" and "text" properties. Texts can be translatables and are processed by tt.
    // [
    //   { icon: "mdi-map-marker-outline", text: "who.location" },
    //   { icon: "mdi-translate-variant", text: "German" },
    //   // Also supports components with props:
    //   { icon: "mdi-phone-outline", component: ObscuredLink, props: { type: "p", segments: "['+', '123', '456']", locked: true} },
    // ]
    items: { type: Array, default: () => [] },

    // If defined, set the given max width
    maxWidth: { type: Number, default: null },

    // The classes to apply to the items
    itemClass: { type: String, default: "" },
});
</script>

<style scoped>
.wrapFlex {
    display: flex;
    align-items: center;
    flex-direction: column;

    line-height: 2em;
}

.wrapFlexContent {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.wrapFlexContent > span {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;

    margin-top: 5px;
}

.wrapFlexContent > span > i {
    margin-top: 5px;
}

.text {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-start;
    align-content: flex-start;
    justify-content: flex-start;
    gap: 10px;
}

.fixedMaxWidth {
    max-width: v-bind(maxWidth);
    margin-left: auto;
    margin-right: auto;
}
</style>
