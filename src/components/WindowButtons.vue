<!--
Provides the common window buttons minimize, maximize, close and fullscreen. 

Depending on the platform support and settings (see jsl/Platform.js), they are shown or not.
-->
<template>
    <v-divider
        v-if="platform.canCloseApp && dividerL"
        :thickness="1"
        class="border-opacity-10 ml-1 mr-1"
        color="#aaaaaa88"
        vertical
    ></v-divider>
    <v-btn
        @click="onMinimize"
        :class="{ hoverbtn: float }"
        v-bind="{ ...$props, ...$attrs }"
        class="raise mr-0"
        v-if="!noMinimize && platform.canMinimizeWindow"
        :icon="iconMinimize"
    />
    <v-btn
        @click="onMaximize"
        :class="{ hoverbtn: float }"
        v-bind="{ ...$props, ...$attrs }"
        class="raise mr-0"
        v-if="!noMaximize && platform.canMaximizeWindow"
        :icon="iconMaximize"
    />
    <v-btn
        @click="onFullscreen"
        :class="{ hoverbtn: float }"
        v-bind="{ ...$props, ...$attrs }"
        class="raise mr-0"
        v-if="!noFullscreen && platform.canFullscreenWindow"
        :icon="iconFullscreen"
    />
    <v-btn
        @click="onClose"
        :class="{ hoverbtn: float }"
        v-bind="{ ...$props, ...$attrs }"
        class="raise mr-0"
        v-if="!noClose && platform.canCloseApp"
        :icon="iconClose"
    />
    <v-divider
        v-if="platform.canCloseApp && dividerR"
        :thickness="1"
        class="border-opacity-10 ml-1 mr-1"
        color="#aaaaaa88"
        vertical
    ></v-divider>
    <QuitDialog v-model="dialog" @yes="close" />
</template>

<script setup>
import { ref } from "vue";

import { platform } from "@jsl/Platform";

import QuitDialog from "@jsl/components/dialogs/QuitDialog.vue";

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

let dialog = ref(false);

const onClose = () => {
    dialog.value = true;
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

const close = () => {
    platform.closeApp();
};
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

.raise {
    z-index: 1001;
}
</style>
