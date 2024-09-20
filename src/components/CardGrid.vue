<!--
CardGrid is a Grid with some defaults and options that are tuned towards "media" or "infocard" views.
-->
<template>
    <Grid
        v-bind="{ ...$props, ...$attrs }"
        :cellWidth="cellSize.w"
        :cellHeight="cellSize.h"
        :rowGap="cellGaps.r"
        :columnGap="cellGaps.c"
    >
        <template #header>
            <div class="titleContainer" :class="{ titleContainerWrap: xs }">
                <slot name="header">
                    <v-icon v-if="titleIcon" class="titleIcon" :class="titleClasses">{{ titleIcon }}</v-icon>
                    <span :class="titleClasses">{{ tt(title) }}</span>
                </slot>
                <v-spacer />

                <Button
                    v-for="action in titleActions"
                    :key="action"
                    class="mr-0"
                    variant="tonal"
                    :loading="action.loading"
                    @click="action.onClicked"
                    :icon="action.icon || 'mdi-help'"
                    v-bind="{ ...actionCardProps, ...(action.props || {}) }"
                />

                <slot name="actions">
                    <!--<v-btn variant="tonal" icon="mdi-plus" />-->
                </slot>
            </div>
        </template>

        <ActionCard
            v-for="action in actionCards"
            :key="action"
            @click="action.onClicked"
            :icon="action.icon || 'mdi-help'"
            :loading="action.loading"
            v-bind="{ ...actionCardProps, ...(action.props || {}) }"
        />

        <slot />
    </Grid>
</template>

<script setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";
const { xs } = useDisplay();

import { tt } from "jsl/Localization";

import Grid from "jsl/components/Grid.vue";
import ActionCard from "@jsl/components/cards/ActionCard.vue";
import Button from "@jsl/components/Button.vue";

const props = defineProps({
    // Some common card size presets: x-small, small, medium, large, x-large, xx-large, xxx-large.
    // Specify Grid's cellWidth/cellHeight explicitly to override the size manually.
    size: { type: String, default: "medium" },

    // Defines the gaps between grids. compact, comfortable, normal, expanded, x-expanded. Can be specified explicitly
    // using rowGap and columnGap.
    density: { type: String, default: "normal" },

    // Cell aspect ratio as width / height. Quadratic by default. Is only in effect, if cellWidth/cellHeight are not
    // explicitly set.
    aspect: { type: Number, default: 1 / 1 },

    // Default header text if the header slot is not overwritten
    title: { default: tt("common.msg.todo", { what: "title!" }) },

    // The style classes of the header/title
    titleClasses: { default: "text-h2 text-uppercase font-weight-thin jsl-font-montserrat" },

    // An optional icon to show next to the title.
    titleIcon: { type: String, default: "" },

    // A list of actions that create buttons next to the title. This is an array of objects:
    titleActions: {
        type: Array,
        default: [
            /*
            // "Refresh" Button
            {
                // The icon to use
                icon: "mdi-refresh",
                // Allows to override titleActionProps for this action
                props: {},
                // A vue bool ref that indicates whether the button should be marked as loading.
                loading: undefined,
                // Called when triggering
                onClicked: () => {
                    console.log("click");
                },
            },*/
        ],
    },

    // Props to pass to the Button representing the title action
    titleActionProps: { default: {} },

    // A list of action cards to create before any content card. This is an array of objects {icon, onClicked }.
    actionCards: {
        type: Array,
        default: [
            /*
            // "Plus" Button
            {
                // The icon to use
                icon: "mdi-plus",
                // Allows to override actionCardProps for this action
                props: {},
                // A vue bool ref that indicates whether the button should be marked as loading.
                loading: undefined,
                // Called when triggering
                onClicked: () => {
                    console.log("click");
                },
            },*/
        ],
    },

    // Props to pass to each created action card
    actionCardProps: { default: { alpha: 0.3 } },

    // ... and the Grid props.
});

const cellSize = computed(() => {
    let w = 350;
    switch (props.size) {
        case "x-small":
            w = 150;
            break;
        case "small":
            w = 250;
            break;
        case "large":
            w = 450;
            break;
        case "x-large":
            w = 550;
            break;
        case "xx-large":
            w = 750;
            break;
        case "xxx-large":
            w = 950;
            break;
        case "medium":
        default:
            w = 350;
            break;
    }
    const h = w / props.aspect;

    return { w: w + "px", h: h + "px" };
});

const cellGaps = computed(() => {
    let w = 2;
    switch (props.density) {
        case "compact":
            w = 1;
            break;
        case "comfortable":
            w = 1.5;
            break;
        case "expanded":
            w = 3;
            break;
        case "x-expanded":
            w = 4;
            break;
        case "medium":
        default:
            w = 2;
            break;
    }
    return { r: w + "rem", c: w + "rem" };
});
</script>

<style scoped>
.titleContainer {
    width: 100%;

    padding-bottom: 1rem;

    display: flex;
    align-items: center;

    /* Computed in containerFlexWrap
    flex-wrap: wrap*/
}

.titleContainerWrap {
    flex-wrap: wrap;
}

.titleIcon {
    margin-right: 1rem;
}
</style>
