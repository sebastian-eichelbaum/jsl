<template>
    <a
        v-if="!disabled"
        @click="onClick"
        id="link"
        class="ma-0 pa-0"
        :class="{ colored: !unstyled, uncolored: unstyled }"
    >
        <slot>{{ href }}</slot>
    </a>

    <span v-else>
        <slot>{{ href }}</slot>
    </span>
</template>

<script setup>
import { platform } from "@jsl/Platform";
import { Test } from "@jsl/Assert";

const props = defineProps({
    href: { type: String, required: true },
    // disable any text color styling
    unstyled: { type: Boolean, required: false, default: false },
    // Opens the link externally. In Browsers, this is a new tab.
    tab: { type: Boolean, required: false, default: false },
    // Disables the link. No href will be opened, no click will be emitted.
    disabled: { type: Boolean, required: false, default: false },

    // If true, clicking the logo does not trigger the href link. Only click is emitted.
    clickOnly: { type: Boolean, required: false, default: false },
});

const emit = defineEmits([
    // Triggered on click, even if the href value is nullish
    "click",
]);

// Handle Clicks
function onClick() {
    if (!props.clickOnly) {
        platform.openLink(props.href, props.tab);
    }
    emit("click");
}
</script>

<style scoped>
#link {
    cursor: pointer;
}

.colored {
    color: -webkit-link;
}

.uncolored {
    color: unset;
}
</style>
