<!--
A common base card that defines background, shapes, sizes and can detect hover. It is the base for all other cards.

-- Styles supported:

* "card.rounded" - default roundedness of the card

-- Slots:

* Anonymous slot {isHovering}: the card contents
* overlay: the contents of the overlay to show on hover via prop overlayOnHover or on demand via showOverlay 
-->
<template>
    <v-hover v-model="hoverState">
        <template v-slot:default="{ isHovering, props }">
            <v-card
                :class="{ preventHoverHighlight: !highlightOnHover }"
                :style="bgStyle"
                v-bind="{ ...$props, ...$attrs, ...props }"
                :rounded="rounded"
                :elevation="elevation"
                @click.stop="onClick"
                :ripple="overlayOpen ? false : $props.ripple"
            >
                <slot :isHovering="isHovering" />

                <v-fade-transition>
                    <div
                        class="hoverOverlayontainer"
                        v-if="overlayOpen"
                        :style="overlayBgStyle"
                        v-click-outside="onClickOutside"
                        @click.stop="onClickOverlay"
                    >
                        <slot name="overlay">
                            <p class="text-h6 mb-5">{{ tt("common.msg.todo", { what: "#overlay" }) }}</p>
                            <Button
                                color="primary"
                                size="x-large"
                                variant="flat"
                                :slim="false"
                                icon="mdi-play"
                                text="TODO"
                            />
                            <Button
                                color="surface"
                                size="x-large"
                                variant="flat"
                                :slim="false"
                                icon="mdi-cog"
                                text="TODO"
                                class="mt-3"
                            />
                        </slot>
                    </div>
                </v-fade-transition>
            </v-card>
        </template>
    </v-hover>
</template>

<script setup>
import { computed, ref, watch } from "vue";

import { tt } from "@jsl/Localization";

import { computedBackgroundStyle, makeBackgroundStyleProps, styleDefaultProp } from "@jsl/utils/Style";

import Button from "@jsl/components/Button.vue";

const props = defineProps({
    // Background style color, blur, alpha, brightness
    ...makeBackgroundStyleProps("", { color: "surface", alpha: 1.0, brightness: 0.4, blur: 50 }),

    // Background for the overlay:
    // Set overlayAlpha=... and so on
    ...makeBackgroundStyleProps("overlay", { color: "background", alpha: 0.0, brightness: 0.5, blur: 3 }),

    // Enable the on-hover overlay? If enabled, hovering opens/closes the overlay automatically
    overlayOnHover: { type: Boolean, default: false },

    // Enable the overlay on click? If enabled, clicking the card opens the overlay.
    overlayOnClick: { type: Boolean, default: false },

    // The prop to manually open the overlay - currently, this only works if overlayOnClick and overlayOnHover are false
    showOverlay: { type: Boolean, default: false },

    // v-cards highlight on hover if they have an @click attached. This is disabled by default. If you want that, set to
    // true
    highlightOnHover: { type: Boolean, default: false },

    // capture the user's preference for ripple as Card modifies the ripple effect if the hover menu is open
    // nice example: { class: 'text-primary' } },
    ripple: {},
});

const emit = defineEmits([
    // Once the overlay visibility changes. The given parameter is a bool that is true if the overlay is visible
    "overlayChange",

    // When clicked on the card
    "click",
]);

const rounded = styleDefaultProp("card.rounded", props.rounded);
const elevation = styleDefaultProp("card.elevation", props.elevation);

const bgStyle = computedBackgroundStyle(props, "");
const overlayBgStyle = computedBackgroundStyle(props, "overlay");

///////////////////////////////////////////////////////////////////
// Click handling
//

const clickOverlayState = ref(false);
const hoverState = defineModel();

// As the overlay visibility depends on some props:
const overlayOpen = computed(() => {
    if (props.overlayOnHover) {
        return props.showOverlay || hoverState.value;
    }
    if (props.overlayOnClick) {
        return props.showOverlay || clickOverlayState.value;
    }

    return props.showOverlay;
});

watch(overlayOpen, (newValue, oldValue) => {
    emit("overlayChange", newValue);
});

const onClick = () => {
    clickOverlayState.value = true;
    emit("click");
};

// Overlay got clicked. This swallows the event
const onClickOverlay = () => {};

// Outside the overlay: close the overlay
const onClickOutside = () => {
    clickOverlayState.value = false;
};
</script>

<style scoped>
.hoverOverlayontainer {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100% !important;
    width: 100% !important;

    transition: 0.33s;
}
</style>

<style>
.preventHoverHighlight .v-card__overlay {
    /* There is an overlay diff that highlights on hover. Disable */
    background-color: unset !important;
}
</style>
