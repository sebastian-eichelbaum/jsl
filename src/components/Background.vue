<!--
Generates a background as large as the parent. The slot will be drawn on top.

TODO: reconsider the name. It is also the base for overlays.
-->

<template>
    <div id="wrapper">
        <div id="backgroundFilterLayer" :style="style" />
        <div id="background" v-if="!noBackground" :class="{ invisibleByDefault: initDefaults }" />
        <div id="content" :class="[contentClass, { invisibleByDefault: initDefaults }]">
            <slot />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";

import { computedBackgroundStyle, computedBackgroundStyleHidden, makeBackgroundStyleProps } from "jsl/utils/Style";
import { afterDomUpdate } from "jsl/utils/Await";

// Visibility model
const model = defineModel({ default: true });

const props = defineProps({
    // Classes for the content div
    contentClass: { default: "" },

    // An background image.
    image: { type: String, required: false, default: "none" },

    // z-index. Especially relevant if the background is used as overlay with an absolute wrapper
    zIndex: { type: [String, Number], default: "unset" },

    // If true, the wrapper div is absolute. It will cover the whole viewport. If false, it is relative.
    absolute: { type: Boolean, default: false },

    // Set to disable the explicit background. Especially useful when using this as overlay.
    noBackground: { type: Boolean, default: false },

    // generate blur, color, alpha, brightness props
    ...makeBackgroundStyleProps("", { color: "background", alpha: 0.0, brightness: 1.0, blur: 50 }),
});

const bgUrl = computed({
    get() {
        if (props.image == null || props.image == "none") {
            return "unset";
        }
        return "url(" + props.image + ")";
    },
});
const bgColor = computed({
    get() {
        if (props.image == null || props.image == "none") {
            return props.color;
        }
        return "transparent";
    },
});

const absWrapper = computed({
    get() {
        return props.absolute ? "absolute" : "relative";
    },
});

// When VUE adds the background overlay to the DOM, it is visible by default. In some situations the DOM update and
// initialization of the component takes place with a visible delay. To prevent this, ensure the content, background and
// filters are hidden by default and are removed after VUE has added and initialized everything.
const initDefaults = ref(true);
onMounted(() => {
    afterDomUpdate(() => {
        initDefaults.value = false;
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// The visibility mechanic
//

const pointerEvents = computed(() => {
    return model.value ? "all" : "none";
});
const contentOpacity = computed(() => {
    return model.value ? 1 : 0;
});

const style = computed(() => {
    return model.value ? computedBackgroundStyle(props).value : computedBackgroundStyleHidden(props).value;
});
</script>

<style scoped>
#wrapper {
    width: 100%;
    height: 100%;
    position: v-bind(absWrapper);
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    pointer-events: v-bind(pointerEvents);

    z-index: v-bind(props.zIndex);
}

#background {
    transition: 0.5s;
    transition-property: opacity, background-color, background-image;
    opacity: v-bind(contentOpacity);

    width: 100vw;
    height: 100vh;

    background-image: v-bind("bgUrl");
    background-color: v-bind("bgColor");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
}

#backgroundFilterLayer {
    width: 100vw;
    height: 100vh;

    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
}

.invisibleByDefault {
    opacity: 0 !important;
}

#content {
    transition: 0.5s;
    transition-property: opacity;
    opacity: v-bind(contentOpacity);

    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
</style>
