<template>
    <div class="fullSize">
        <div id="header" :class="alignStyle(headerAlign)">
            <slot name="header">
                <slot name="header"> </slot>
            </slot>
        </div>
        <div id="body" class="mb-5 mt-5" :class="alignStyle(bodyAlign)">
            <slot> Place Main Content Here </slot>
        </div>
        <div id="footer" :class="alignStyle(footerAlign)">
            <slot name="footer">
                <slot name="footer"> </slot>
            </slot>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
    // Expand to the parent div size by using an absolute placement. This only works for parents that are position:relative
    // but has the advantage that it also works without explicit height in the parent.
    noExpand: { type: Boolean, default: false },

    // Where to justify the whole panel if it is not as large/larger than the container.
    // Only takes affect when noExpand is not set.
    justify: { type: String, required: false, default: "center" },

    // Alignment of the header contents: start, center, end
    headerAlign: { type: String, required: false, default: "center" },

    // Alignment of the  body contents: start, center, end, space-between, space-around, stretch
    bodyAlign: { type: String, required: false, default: "center" },
    bodyJustify: { type: String, required: false, default: "center" },

    // Alignment of the footer contents: start, center, end
    footerAlign: { type: String, required: false, default: "center" },
});

function alignStyle(align) {
    switch (align) {
        case "left":
        case "start":
            return "flexLeft";

        case "right":
        case "end":
            return "flexRight";

        default:
            return "flexCenter";
    }

    return "flexCenter";
}

const growBody = computed(() => {
    return props.noExpand === true ? 0 : 1;
});
</script>

<style scoped>
.flexRight {
    align-content: flex-end;
    align-items: flex-end;
}

.flexCenter {
    align-content: center;
    align-items: center;
}

.flexLeft {
    align-content: flex-start;
    align-items: flex-start;
}

#body {
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: v-bind(bodyJustify);
    flex-wrap: nowrap;

    flex-grow: v-bind(growBody);
}

#header {
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
}

#footer {
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
}

.fullSize {
    display: flex;
    flex-direction: column;
    /*justify-content: space-between;*/
    justify-content: v-bind(justify);
    flex-wrap: wrap;
}
</style>
