<!--
A card that shows a big icon and acts like a button.

Forwards all props to Card.vue
Anonymous slot extends the icon, "isHovering" is passed
-->
<template>
    <Card v-bind="{ ...$props, ...$attrs }" :href="null" @click="onClick">
        <template v-slot:default="{ isHovering }">
            <div class="iconContainer">
                <v-icon
                    :color="isHovering ? iconHoverColor : iconColor"
                    :style="hoverScale(isHovering)"
                    :size="iconSize"
                    >{{ icon }}</v-icon
                >
                <slot :isHovering="isHovering" />
            </div>
        </template>

        <!-- Also remember: Card offers a nice #overlay-->
        <template #overlay>
            <slot name="overlay" />
        </template>
    </Card>
</template>

<script setup>
import { computed } from "vue";

import { platform } from "jsl/Platform";
import { tt } from "jsl/Localization";
import { vuetify } from "jsl/Vuetify";

import Card from "jsl/components/cards/Card.vue";

const props = defineProps({
    // The icon to show
    icon: { type: String, default: "mdi-plus" },
    // The size/color/hover of the icon
    iconSize: { default: "8rem" },
    iconHoverScale: { default: "1.2" },
    iconColor: { default: "grey" },
    iconHoverColor: { default: "primary" },

    // Opens this on click if not nullish/empty.
    href: { type: String, default: null },

    // ... and the Card props.
});

const emit = defineEmits(["click"]);

const isHovvering = defineModel();

const onClick = () => {

    if (!(props.href == null || props.href == "")) {
        platform.openLink(props.href, true);
    }

    // Just forward?
    emit("click");
};

function hoverScale(isHovering) {
    return "transform: scale(" + (isHovering ? props.iconHoverScale : 1.0) + ");";
}
</script>

<style scoped>
.iconContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100% !important;
    width: 100% !important;

    transition: 0.33s;
}

.iconContainer i {
    transition: 0.33s;
}
</style>
