<template>
    <div class="grid">
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
    // Width of a cell. Include units!
    cellWidth: { type: String, default: "350px" },
    // Height of a cell. Include units!
    cellHeight: { type: String, default: "350px" },

    // Gap between rows
    rowGap: { type: String, default: "2rem" },
    // Gap between cols
    columnGap: { type: String, default: "2rem" },

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
});
</script>

<style scoped>
.grid {
    display: grid;

    /* Not yet fully working in most browsers */
    transition: all 0.5s;

    /* Make columns with given width or 100% if the given width is too large */
    grid-template-columns: repeat(auto-fill, min(v-bind("cellWidth"), 100%));
    /* Unnamed rows/cols are used. So this defines the dynamically generated cells */
    grid-auto-columns: v-bind("cellWidth");
    grid-auto-rows: v-bind("cellHeight");

    row-gap: v-bind("rowGap");
    column-gap: v-bind("columnGap");

    justify-content: v-bind("justifyContent");
    align-content: v-bind("alignContent");

    justify-items: v-bind("justifyItems");
    align-items: v-bind("alignItems");
}

.gridItem {
    background: black;
}
</style>
