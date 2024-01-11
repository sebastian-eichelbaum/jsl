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

const props = defineProps({
    href: { type: String, required: true },
    // disable any text color styling
    unstyled: { type: Boolean, required: false, default: false },
    // Opens the link externally. In Browsers, this is a new tab.
    tab: { type: Boolean, required: false, default: false },
    // Makes the
    disabled: { type: Boolean, required: false, default: false },
});

// Handle Clicks
function onClick() {
    platform.openLink(props.href, props.tab);
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
