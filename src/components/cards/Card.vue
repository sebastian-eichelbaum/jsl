<!--
A common base card that defines background, shapes, sizes and can detect hover. It is the base for all other cards.

-- Styles supported:

* "card.rounded" - default roundedness of the card

-- Slots:

* Anonymous slot: the card contents
-->
<template>
    <v-hover>
        <template v-slot:default="{ isHovering, props }">
            <v-card
                :style="style"
                v-bind="{ ...$props, ...$attrs, ...props }"
                :rounded="rounded"
                :elevation="elevation"
            >
                <slot :isHovering="isHovering" />
            </v-card>
        </template>
    </v-hover>
</template>

<script setup>
import { computed } from "vue";

import { tt } from "@jsl/Localization";

import { computedBackgroundStyle, makeBackgroundStyleProps, styleDefaultProp } from "@jsl/utils/Style";

const props = defineProps({
    // Background style color, blur, alpha, brightness
    ...makeBackgroundStyleProps("", { color: "surface", alpha: 1.0, brightness: 0.4, blur: 50 }),
});

const rounded = styleDefaultProp("card.rounded", props.rounded);
const elevation = styleDefaultProp("card.elevation", props.elevation);

const style = computedBackgroundStyle(props, "");
</script>
