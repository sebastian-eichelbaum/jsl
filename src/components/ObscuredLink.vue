<!--
A component that shows an obscured link that tries to be invisible to spam bots.

Refer to https://spencermortensen.com/articles/email-obfuscation/#text-conversion

This component combines
* the span-display:none method with random characters
* the concatenation of segments method
* Trigger the link from JS instead of using <a>
* Replace the links with garbage until the user interacts with the page (optional)

Examples:

Mail: <ObscuredLink class="font-weight-bold text-mono" type="m" :segments="['sophia', '@', 'ex', 'ampl', 'e.', 'dev']" locked />
Phone: <ObscuredLink type="p" :segments="['+', '49', ' 123', ' 4567', ' 8901']" locked />

NOTE: this link is unstyled. You should style it to match your theme's link-style

-->
<template>
    <ul class="horizontal obslnk a" @click="onClick">
        <li v-for="(segment, i) in segs" :key="segment" :class="i === 0 ? 'first' : ''">
            <span color="primary" class="item hidden">{{ segment }}</span>
            <span class="hstd">{{ garbage(i) }}</span>
        </li>
    </ul>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

import { resolveColor } from "jsl/utils/Style";
import { platform } from "jsl/Platform";

const props = defineProps({
    // A list of segments to concatenate to form the final mail/phone/url
    segments: { type: Array, default: () => [] },

    // Type of the link: m = mailto, p = phone, anything else = url
    type: { type: String, default: "" },

    // By default, links open externally. Set this to open the link in this site. Only works for web urls.
    targetSelf: { type: Boolean, default: false },

    // If set, the link is garbage until the user interacts with the page
    locked: { type: Boolean, default: false },

    // The color to use for this link
    color: { type: String, default: undefined },
});

const garbage = (i, num) => {
    // Generate a sequence of alphanumeric characters, 10 characters long
    // to make it harder for bots to parse the link
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let j = 0; j < num; j++) {
        result += chars.charAt((i + Math.floor(Math.random() * chars.length)) % chars.length);
    }
    return result;
};

const isLocked = ref(true);

// This wraps around the given segments and replaces chars with other chars until the link is unlocked by interaction
const segs = computed(() => {
    if (isLocked.value === false) {
        return props.segments.map((item) => {
            return item.toLowerCase();
        });
    }

    return props.segments.map((segment) => {
        let newSegment = "";
        for (let i = 0; i < segment.length; i++) {
            newSegment += garbage(i, 1);
        }
        return newSegment;
    });
});

const resolvedColor = computed(() => {
    if (props.color == null || props.color === "") {
        return null;
    }

    return resolveColor(props.color)?.toCSS();
});

function onClick() {
    const prefix = props.type === "m" ? "mailto:" : props.type === "p" ? "tel:" : "";
    const url =
        prefix +
        props.segments
            .map((item) => {
                return item.trim().toLowerCase();
            })
            .join("");

    platform.openLink(url, !props.targetSelf);
}

function cleartListener() {
    document.removeEventListener("mouseenter", listener);
    document.removeEventListener("focus", listener);
    document.removeEventListener("touchstart", listener);
    document.removeEventListener("wheel", listener);
}

function listener(event) {
    cleartListener();
    isLocked.value = false;

    // Unlock the link
}

onMounted(() => {
    if (props.locked === false) {
        isLocked.value = false;
        return;
    }
    document.addEventListener("mouseenter", listener);
    document.addEventListener("focus", listener);
    document.addEventListener("touchstart", listener);
    document.addEventListener("wheel", listener);
});

onUnmounted(() => {
    cleartListener();
});
</script>

<style scoped>
ul.horizontal {
    display: inline-block;
    list-style-type: none;
}

ul.horizontal li {
    margin: 0;
    padding: 0;
    display: inline;
}

.hstd {
    display: none;
}

.hidden {
    display: inline;
}

.obslnk {
    cursor: pointer;
}

.item {
    color: v-bind(resolvedColor);
}
</style>
