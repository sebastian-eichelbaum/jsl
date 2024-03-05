<!--
Show a user button with name and profile dialog if the backend supports users.

The anonymous slot is the UserDialog slot
-->
<template>
    <Button v-if="backend.user" :hideText="smAndDown" v-bind="{ ...$props, ...$attrs }" :text="uname">
        <UserDialog v-model="dialog" activator="parent">
            <slot />
        </UserDialog>
    </Button>
</template>

<script setup>
import { computed, ref } from "vue";

import Button from "@jsl/components/Button.vue";

import UserDialog from "@jsl/components/user/UserDialog.vue";

import { userName } from "@jsl/utils/Backend";
import { backend } from "@jsl/Backend";

import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();

const dialog = ref(false);

const props = defineProps({
    icon: { type: String, required: false, default: "mdi-account" },

    fullUserName: { type: Boolean, default: false },

    // + Props from jsl/components/Button.vue
});

const uname = computed(() => {
    if (props.fullUserName) {
        return userName();
    }

    // First word
    return userName().replace(/ .*/, "");
});
</script>
