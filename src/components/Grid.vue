<!--
A component that allows to define regular grids easily. This reflects some of the CSS grids features.

* Anonymous slot: the content that is filled automatically filled into the cols/rows of the grid.
* "header" slot: a complete header row to fill.

-->
<template>
    <div class="grid">
        <div class="gridHeaderRow">
            <slot name="header" />
        </div>

        <slot>
            <v-card v-for="n in 5" :key="n">
                <v-card-title>
                    {{ tt("common.msg.todo", { what: "default slot!" }) }}
                </v-card-title>
            </v-card>
        </slot>
    </div>
</template>

<script setup>
import { tt } from "@jsl/Localization";

const props = defineProps({
    // Width of a cell. Include units! You can use percent to grow cells to a certain size of the enclosing container
    cellWidth: { type: String, default: "350px" },
    // Height of a cell. Include units! Use "auto" to make cells match the content height.
    cellHeight: { type: String, default: "350px" },

    // Gap between rows
    rowGap: { type: String, default: "1rem" },
    // Gap between cols
    columnGap: { type: String, default: "1rem" },

    // A grid that is smaller than the grid container horizontally, align or space out:
    // start, end, center, space-between, space-evenly, ...
    justifyContent: { type: String, default: "center" },
    // A grid that is smaller than the grid container vertically, align or space out:
    // start, end, center, space-between, space-evenly, ...
    alignContent: { type: String, default: "start" },

    // Items that do not match the size of the cell horizontally:
    // start, center, end, stretch, baseline, ...
    // Items can override this using "justify-self"
    justifyItems: { type: String, default: "stretch" },

    // Items that do not match the size of the cell vertically:
    // start, center, end, stretch, baseline, ...
    // Items can override this using "align-self"
    alignItems: { type: String, default: "stretch" },

    // How many columns to generate? Can be a number or a special keyword:
    //
    // Assume the container is large enough to accommodate 4 cells but only 2 are given.
    // - auto-fill tells the grid to fill in empty cells, causing the 2 given items to be on the left.
    // - auto-fit tells the grid to not fill empty cells, causing the grid to shrink and be aligned according to
    //            justifyContent.
    columns: { type: String, default: "auto-fill" },

    // Height of the header row. If auto, it is scaled to the contents, including margins.
    headerHeight: { type: String, default: "auto" },

    // Set the max width of the grid container. Handy in combination with cellWidth percentages.
    maxWidth: { type: String, default: "unset" },
});
</script>

<style scoped>
.grid {
    display: grid;

    /* Not yet fully working in most browsers */
    transition: all 0.5s;

    /* Make columns with given width or 100% if the given width is too large */
    grid-template-columns: repeat(v-bind("columns"), min(v-bind("cellWidth"), 100%));

    /* Create an explizit header row */
    grid-template-rows: [headrow-start] v-bind(headerHeight) [headrow-end] v-bind("cellHeight") [lastrow];

    /* Unnamed rows/cols are used. So this defines the dynamically generated cells */
    grid-auto-columns: v-bind("cellWidth");
    grid-auto-rows: v-bind("cellHeight");

    row-gap: v-bind("rowGap");
    column-gap: v-bind("columnGap");

    justify-content: v-bind("justifyContent");
    align-content: v-bind("alignContent");

    justify-items: v-bind("justifyItems");
    align-items: v-bind("alignItems");

    max-width: v-bind(maxWidth);
}

.gridItem {
    background: black;
}

.gridHeaderRow {
    grid-row-start: headrow-start;
    grid-row-end: headrow-end;

    /* Makes the header span from first cell to last (-1) */
    grid-column-start: 1;
    grid-column-end: -1;

    /* Setting contents breaks the grid column selection? */
    /* Setting flex ensures the real size is used. Other implications? */
    display: flex;
}
</style>
