<template>
    <v-btn
        @click="askClose"
        :class="{ hoverbtn: !nofloat }"
        size="large"
        class="raise"
        :rounded="rounded ? 'xl' : '0'"
        :variant="variant"
        icon="mdi-close"
    >
    </v-btn>
    <QuitDialog v-model="dialog" variant="evenly" @yes="close" />
</template>

<script setup>
import { ref } from "vue";

import { platform } from "@jsl/Platform";
import QuitDialog from "@jsl/components/dialogs/QuitDialog.vue";

const props = defineProps({
    variant: { type: String, required: false, default: "text" },
    rounded: { type: Boolean, required: false, default: false },
    nofloat: { type: Boolean, required: false, default: false },
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
