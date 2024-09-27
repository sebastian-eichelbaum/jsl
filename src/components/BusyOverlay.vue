<!--
A nice busy overlay that wraps the whole slot content and shades it a bit.

* The anonymous slot is the content itself.
* Slot "overlay" is the arbitrary content to show on the overlay if busy. Is a spinner by default. Passes "message" and "percent"

Example:

<BusyOverlay :busy="true" msg="common.msg.greet" :percent="12">
    <template #overlay="{ message, percent }"> Textspinner huiiii: {{ percent }} {{ message }} </template>
</BusyOverlay>

-->
<template>
    <div id="container">
        <div id="content" :class="{ busyContent: busy }">
            <slot>TODO: Put something in here.</slot>
        </div>

        <Busy overlay v-bind="{ ...$props, ...$attrs }">
            <template #spinner="{ message, percent }">
                <slot name="overlay" :message="message" :percent="percent" />
            </template>
        </Busy>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { localization } from "jsl/Localization";

import Busy from "./utils/Busy.vue";

const props = defineProps({
    // If true, the form is assumed to be busy
    busy: { type: Boolean, required: false, default: false },

    // Ensure these defaults. (might be different from the busy component)

    // If the default overlay is used, this defines the size of the v-progress-circular
    spinnerSize: { required: false, default: 70 },
    // If the default overlay is used, this defines the width of the v-progress-circular
    spinnerWidth: { required: false, default: 5 },
    // If the default overlay is used, this defines the color of the v-progress-circular
    spinnerColor: { type: String, required: false, default: "primary" },
});
</script>

<style scoped>
#container {
    position: relative;
}

#content {
    transition: 0.5s;
    transition-property: opacity, filter;
}

.busyContent {
    opacity: 0.33;
    filter: blur(2px);
}
</style>
