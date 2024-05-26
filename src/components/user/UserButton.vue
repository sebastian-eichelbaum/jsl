<!--
Show a user button with name and profile dialog if the backend supports users.

The anonymous slot is the UserDialog slot

-->
<template>
    <Button v-if="backend.user" :hideText="smAndDown" v-bind="{ ...$props, ...$attrs }" :text="uname">
        <UserDialog v-if="!noDialog" v-model="dialog" activator="parent" :service="service">
            <slot />
        </UserDialog>
    </Button>
</template>

<script setup>
import { computed, ref } from "vue";

import Button from "jsl/components/Button.vue";

import UserDialog from "jsl/components/user/UserDialog.vue";

import { userName, userNameShort } from "jsl/utils/Backend";
import { UserService, backend } from "jsl/Backend";

import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();

const dialog = ref(false);

const props = defineProps({
    icon: { type: String, required: false, default: "mdi-account" },

    // Show the full name? If false, only the first word is used.
    fullUserName: { type: Boolean, default: false },

    // If true, the default UserDialog is not used. Instead, you need to handle @click
    noDialog: { type: Boolean, default: false },

    // The user service to utilize
    service: { type: UserService, required: true },

    // + Props from jsl/components/Button.vue
});

const uname = computed(() => {
    if (props.fullUserName) {
        return userName();
    }

    return userNameShort();
});
</script>
