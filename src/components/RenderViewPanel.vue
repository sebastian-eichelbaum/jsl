<!--
Creates simpel panels at the edges/sides of an relative parent (the RenderView). They can be styled. Some defaults are
relative to the location. For example, rounded will, by default, round the corners that point inside the view.

* Anonymous slot is the content.
-->

<template>
    <div
        id="jslRenderViewPanel"
        :class="[locationClass, flexClass, borderClass, paddingClass, shadowClass]"
        :style="backgroundStyle"
    >
        <slot> TODO: content </slot>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

import { makeBackgroundStyleProps, computedBackgroundStyle, computedBackgroundStyleHidden } from "jsl/utils/Style";

const model = defineModel({ default: true });

const props = defineProps({
    // If set, let the panel be fully transparent for clicks/touches. Ideal for logo overlays that should not react to
    // input.
    noEventCapture: { type: Boolean, default: false },

    // If not set, make the panels flex layout with location dependent defaults. For example, a location=="l" sidebar will
    // row-wise show each item, centered, evenly spaced just like a nice button side-panel.
    noFlex: { type: Boolean, default: false },

    // Allows you to explicitly set the flex direction. For example, id location is "l", the automatic flex layout creates a
    // nice vertical button layout. For location="tl", it creates a horizontal layout by default. With flexDirection, you
    // can override that "smartness". Set "auto" or undefined for smart, "horizontal", "h" or "vertical", "v".
    flexDirection: { type: String, default: undefined },

    // flex-start, flex-end, stretch, baseline, center or undefined
    alignItems: { type: String, default: undefined },

    // Where to put it? Possible values: b,t,r,l,bl,br,tl,tr
    location: { type: String, default: "bl" },

    // Width/height of the panel. You should specify these in vw/vh relative scales.
    width: { type: String, default: "unset" },
    // Width/height of the panel. You should specify these in vw/vh relative scales.
    height: { type: String, default: "unset" },

    // Max width/height of the panel. These should be absolute sizes.
    maxWidth: { type: String, default: "unset" },
    // Max width/height of the panel. These should be absolute sizes.
    maxHeight: { type: String, default: "unset" },

    // Min width/height of the panel. These should be absolute sizes.
    minWidth: { type: String, default: "unset" },
    // Min width/height of the panel. These should be absolute sizes.
    minHeight: { type: String, default: "unset" },

    // Border rounding. Like in vuetify, "0", "sm", "md", "lg", "xl"
    rounded: { type: String, default: "0" },
    // Make rounded shape all corners, not only those that are pointing to the inside of the view.
    allBorders: { type: Boolean, default: false },

    // Border width
    borderWidth: { type: String, default: "0px" },
    // Border color
    borderColor: { type: String, default: "#ffffff22" },

    // The padding to use by default
    padding: { type: String, default: "10px" },
    // A padding that is used on that edge that ist at the outside border(s) of the viewport. Sometimes it looks a bit
    // better if the edge padding is not as large.
    edgePadding: { type: String, default: "6px" },

    // Add a "soft", "strong", or "hard" shadow. Use "none" to disable that
    shadow: { type: String, default: "none" },

    // Panel background.
    ...makeBackgroundStyleProps("", { color: "transparent", alpha: 1.0, brightness: 1.0, blur: 0 }),
});

const locationClass = computed(() => {
    switch (props.location) {
        case "b":
            return "_b _hCenter";
        case "t":
            return "_t _hCenter";
        case "r":
            return "_r _vCenter";
        case "l":
            return "_l _vCenter";
        case "bl":
            return "_l _b ";
        case "br":
            return "_b _r";
        case "tl":
            return "_t _l";
        case "tr":
            return "_t _r";
    }
    return "_l _b";
});

const shadowClass = computed(() => {
    switch (props.shadow) {
        case "soft":
            return "jsl-shadow-soft";
        case "strong":
            return "jsl-shadow-strong";
        case "hard":
            return "jsl-shadow-hard";
        default:
            return "";
    }
});

const flexClass = computed(() => {
    if (props.noFlex === true) {
        return "";
    }

    let flexDir = undefined;
    if (props.flexDirection === "horizontal" || props.flexDirection === "h") {
        flexDir = "_flexH";
    }
    if (props.flexDirection === "vertical" || props.flexDirection === "v") {
        flexDir = "_flexV";
    }

    switch (props.location) {
        case "b":
            return flexDir ?? "_flexH";
        case "t":
            return flexDir ?? "_flexH";
        case "r":
            return flexDir ?? "_flexV";
        case "l":
            return flexDir ?? "_flexV";
        case "bl":
            return flexDir ?? "_flexH";
        case "br":
            return flexDir ?? "_flexH";
        case "tl":
            return flexDir ?? "_flexH";
        case "tr":
            return flexDir ?? "_flexH";
    }
    return "";
});

const paddingClass = computed(() => {
    switch (props.location) {
        case "b":
            return "_defaultPadding _paddingAtB";
        case "t":
            return "_defaultPadding _paddingAtT";
        case "r":
            return "_defaultPadding _paddingAtR";
        case "l":
            return "_defaultPadding _paddingAtL";
        case "bl":
            return "_defaultPadding _paddingAtB _paddingAtL";
        case "br":
            return "_defaultPadding _paddingAtB _paddingAtR";
        case "tl":
            return "_defaultPadding _paddingAtT _paddingAtL";
        case "tr":
            return "_defaultPadding _paddingAtT _paddingAtR";
    }
    return "_defaultPadding";
});

const borderClass = computed(() => {
    if (props.allBorders === true) {
        return "_borderTL _borderTR _borderBL _borderBR _solidBorder";
    }

    switch (props.location) {
        case "b":
            return "_borderTL _borderTR _solidBorder  _solidBoderNoB";
        case "t":
            return "_borderBL _borderBR _solidBorder _solidBoderNoT";
        case "r":
            return "_borderTL _borderBL _solidBorder _solidBoderNoR";
        case "l":
            return "_borderTR _borderBR _solidBorder _solidBoderNoL";
        case "bl":
            return "_borderTR _solidBorder _solidBoderNoB _solidBoderNoL";
        case "br":
            return "_borderTL _solidBorder _solidBoderNoB _solidBoderNoR";
        case "tl":
            return "_borderBR _solidBorder _solidBoderNoT _solidBoderNoL";
        case "tr":
            return "_borderBL _solidBorder _solidBoderNoT _solidBoderNoR";
    }
    return "";
});

const borderRadius = computed(() => {
    switch (props.rounded) {
        case "0":
            return "0px";
        case "sm":
            return "2px";
        case "md":
            return "4px";
        case "lg":
            return "8px";
        case "xl":
            return "24px";
        case "pill":
            return "9999px";
        case "circle":
            return "50%";
    }
    return "0px";
});

const pointerEvents = computed(() => {
    return props.noEventCapture === true || model.value == false ? "none" : "all";
});

const overflowX = computed(() => {
    return "unset";
});

const overflowY = computed(() => {
    return "auto";
});

const backgroundStyle = computed(() => {
    return model.value ? computedBackgroundStyle(props).value : computedBackgroundStyleHidden(props).value;
});

const boxOpacity = computed(() => {
    return model.value ? 1.0 : 0.0;
});

const boxTransform = computed(() => {
    if (model.value == true) {
        // Must not be empty when combined with those transforms in the _r/_l,... classes
        return "translate(0, 0) scale(1)";
    }

    // TODO: having a translation on the right causes the wrapper to grow -> scrollbars. Find a way to make this look
    // like for the cases on the left (slide in instead of scale in).

    switch (props.location) {
        case "b":
            return "scale(0)";
        case "t":
            return "scale(0)";
        case "r":
            return "scale(0)";
        case "l":
            return "translate(-100%, 0)";
        case "bl":
            return "translate(-100%, 0)";
        case "br":
            return "scale(0)";
        case "tl":
            return "translate(-100%, 0)";
        case "tr":
            return "scale(0)";
    }
});
</script>

<style lang="scss" scoped>
/*********************************************
 * Location specific things
 */

._l {
    left: 0;

    transform: v-bind(boxTransform);
}
._r {
    right: 0;
    transform: v-bind(boxTransform);
}
._t {
    top: 0;
    transform: v-bind(boxTransform);
}
._b {
    bottom: 0;
    transform: v-bind(boxTransform);
}

._hCenter {
    left: 50%;
    transform: translate(-50%, 0) v-bind(boxTransform);
}
._vCenter {
    top: 50%;
    transform: translate(0, -50%) v-bind(boxTransform);
}

._flexV {
    align-content: center;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: space-evenly;

    align-items: v-bind(alignItems);

    display: flex;
}

._flexH {
    align-content: center;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    align-items: v-bind(alignItems);

    display: flex;
}

._borderTL {
    border-top-left-radius: v-bind(borderRadius);
}

._borderTR {
    border-top-right-radius: v-bind(borderRadius);
}
._borderBL {
    border-bottom-left-radius: v-bind(borderRadius);
}
._borderBR {
    border-bottom-right-radius: v-bind(borderRadius);
}

._solidBorder {
    border: solid;
    border-width: v-bind(borderWidth);
    border-color: v-bind(borderColor);
}

._solidBoderNoT {
    border-top: none;
}

._solidBoderNoB {
    border-bottom: none;
}

._solidBoderNoR {
    border-right: none;
}

._solidBoderNoL {
    border-left: none;
}

._defaultPadding {
    padding: v-bind(padding);
}

._paddingAtL {
    padding-left: v-bind(edgePadding);
}

._paddingAtR {
    padding-right: v-bind(edgePadding);
}

._paddingAtT {
    padding-top: v-bind(edgePadding);
}

._paddingAtB {
    padding-bottom: v-bind(edgePadding);
}

/********************************************
 * Box styling
 */

.box {
    transition: 0.3s;
    transition-property: backdrop-filter, background-color, opacity, transform !important;

    opacity: v-bind(boxOpacity);

    position: absolute;

    width: v-bind(width);
    height: v-bind(height);
    min-width: v-bind(minWidth);
    min-height: v-bind(minHeight);
    max-width: v-bind(maxWidth);
    max-height: v-bind(maxHeight);

    overflow-x: v-bind(overflowX);
    overflow-y: v-bind(overflowY);

    pointer-events: v-bind(pointerEvents);
}

#jslRenderViewPanel {
    @extend .box;
}
</style>
