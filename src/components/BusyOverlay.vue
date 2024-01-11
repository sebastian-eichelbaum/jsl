<!--
A nice busy overlay that wraps the whole slot content and shades it a bit.

* The anonymous slot is the content itself.
* Slot "overlay" is the arbitrary content to show on the overlay if busy. Is a spinner by default.
-->
<template>
    <div id="container">
        <div id="content" :class="{ busyContent: busy }">
            <slot>TODO: Put something in here.</slot>
        </div>

        <v-fade-transition mode="out-in">
            <div id="overlay" v-if="busy">
                <div id="overlayContent">
                    <slot name="overlay">
                        <v-progress-circular
                            :size="spinnerSize"
                            :width="spinnerWidth"
                            :color="spinnerColor"
                            :indeterminate="percent < 0"
                            :model-value="roundedPercent"
                            id="spinner"
                        >
                            <span v-if="roundedPercent >= 0" class="font-weight-bold">{{ roundedPercent }}%</span>
                        </v-progress-circular>
                        <p v-if="msg" class="mt-5" align="center">{{ localization.tt(msg) }}</p>
                    </slot>
                </div>
            </div>
        </v-fade-transition>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { localization } from "@jsl/Localization";

const props = defineProps({
    // If true, the form is assumed to be busy
    busy: { type: Boolean, required: false, default: false },
    
    // A message to display.
    msg: { type: String, required: false, default: "" },
    
    // A percentage to display. If negative, the spinner is indeterminate
    percent: { type: Number, required: false, default: -1 },

    // If the default overlay is used, this defines the size of the v-progress-circular
    spinnerSize: { required: false, default: 70 },
    // If the default overlay is used, this defines the width of the v-progress-circular
    spinnerWidth: { required: false, default: 5 },
    // If the default overlay is used, this defines the color of the v-progress-circular
    spinnerColor: { type: String, required: false, default: "primary" },
});

const roundedPercent = computed(() => Math.round(props.percent));
</script>

<style scoped>
#container {
    position: relative;
}

#overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
}

#content {
    transition: 0.5s;
    transition-property: opacity, filter;
}

.busyContent {
    opacity: 0.33;
    filter: blur(2px);
}

#spinner {
    left: 50%;
    transform: translateX(-50%);
}

#overlayContent {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    width: 100%;
    padding: 1em;
}
</style>
