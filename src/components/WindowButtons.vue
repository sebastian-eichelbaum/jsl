<!--
Provides the common window buttons minimize, maximize, close and fullscreen. 

Depending on the platform support and settings (see jsl/Platform.js), they are shown or not.

NOTE: this does NOT provide a quit confirm dialog. It just triggers Platform.windowClose. jsl App.vue provides a handler
for this. Either use this or provide your own.
-->
<template>
    <div class="raise" :class="{ hoverbtn: float, block: !float }">
        <v-divider
            v-if="platform.canCloseWindow && dividerL"
            :thickness="1"
            class="border-opacity-10 ml-1 mr-1"
            color="#aaaaaa88"
            vertical
        ></v-divider>
        <v-btn
            @click="onMinimize"
            v-bind="{ ...$props, ...$attrs }"
            class="mr-0"
            v-if="!noMinimize && platform.canMinimizeWindow"
            :icon="iconMinimize"
        />
        <v-btn
            @click="onMaximize"
            v-bind="{ ...$props, ...$attrs }"
            class="mr-0"
            v-if="!noMaximize && platform.canMaximizeWindow"
            :icon="iconMaximize"
        />
        <v-btn
            @click="onFullscreen"
            v-bind="{ ...$props, ...$attrs }"
            class="mr-0"
            v-if="!noFullscreen && platform.canFullscreenWindow"
            :icon="iconFullscreen"
        />
        <v-btn
            @click="onClose"
            v-bind="{ ...$props, ...$attrs }"
            class="mr-0"
            v-if="!noClose && platform.canCloseWindow"
            :icon="iconClose"
        />
        <v-divider
            v-if="platform.canCloseWindow && dividerR"
            :thickness="1"
            class="border-opacity-10 ml-1 mr-1"
            color="#aaaaaa88"
            vertical
        ></v-divider>
    </div>
</template>

<script setup>
import { ref } from "vue";

import { platform } from "@jsl/Platform";

const props = defineProps({
    variant: { default: "text" },

    iconClose: { default: "mdi-window-close" },
    iconMinimize: { default: "mdi-window-minimize" },
    iconMaximize: { default: "mdi-window-maximize" },
    iconFullscreen: { default: "mdi-fullscreen" },

    size: { default: "large" },

    // If true, the buttons hover on top of the window. Use this if the buttons are not in an AppBar for example.
    float: { type: Boolean, required: false, default: false },

    // Add a divider to the right?
    dividerR: { type: Boolean, required: false, default: false },
    // Add a divider to the left?
    dividerL: { type: Boolean, required: false, default: false },

    // Set to explicitly disable buttons regardless of the platform settings.
    noMinimize: { type: Boolean, required: false, default: false },
    noMaximize: { type: Boolean, required: false, default: false },
    noFullscreen: { type: Boolean, required: false, default: false },
    noClose: { type: Boolean, required: false, default: false },
});

const emit = defineEmits([
    // If the user changed the fullscreen state using these buttons
    "fullscreenChanged",
]);

const onClose = () => {
    // Be sure to ask
    platform.forceClose = false;
    platform.windowClose();
};

const onMinimize = () => {
    platform.windowMinimize();
};

const onMaximize = () => {
    platform.windowMaximize();
};

const onFullscreen = () => {
    platform.windowFullscreen().then((newState) => {
        emit("fullscreenChanged", newState);
    });
};

const close = () => {};
</script>

<style scoped>
.hoverbtn {
    display: inline-block;
    margin-top: -60px;
    transform-origin: 0% 0%;
    position: sticky;
    top: 0;
    right: 0;

    float: right;
}

.block {
    display: contents;
}

.raise {
    z-index: 1001;
}
</style>
