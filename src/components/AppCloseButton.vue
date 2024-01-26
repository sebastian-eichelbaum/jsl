<template>
    <v-divider
        v-if="platform.canCloseApp && dividerL"
        :thickness="1"
        class="border-opacity-10 ml-1 mr-1"
        color="#aaaaaa88"
        vertical
    ></v-divider>
    <v-btn
        @click="askClose"
        :class="{ hoverbtn: !nofloat }"
        v-bind="{ ...$props, ...$attrs }"
        class="raise mr-0"
        v-if="platform.canCloseApp"
    >
    </v-btn>
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
    icon: { default: "mdi-close" },
    size: { default: "large" },
    nofloat: { type: Boolean, required: false, default: false },

    // Add a divider to the right?
    dividerR: { type: Boolean, required: false, default: false },
    // Add a divider to the left?
    dividerL: { type: Boolean, required: false, default: false },
});

let dialog = ref(false);

const askClose = () => {
    dialog.value = true;
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
