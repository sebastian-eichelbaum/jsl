<!--
A simple user profile page.

ATTENTION: work in progress. Subject to change
-->

<template>
    <div :style="{ 'max-width': maxWidth }">
        <BackButton
            :disabled="busy"
            class="mb-6"
            variant="plain"
            rounded="xl"
            @yes="onBack"
            doNotAsk
            text="common.ui.backToOverview"
        />
        <div class="mb-5 text-h2 font-weight-thin jsl-font-montserrat text-truncate">
            {{ tt(title, { user: tt(uname) }) }}
        </div>
        <LogoutButton :disabled="busy" size="large" :slim="false" rounded="xl" :text="logoutText" />

        <!--
        <div class="mt-5 text-body-2">
            {{ tt(subtitle, { user: tt(uname) }) }}
        </div>
        -->

        <EmailVerificationAlert class="mt-5 mb-2" :service="service" />

        <!--
        <v-divider class="mb-7 mt-10" thickness="2" />
        <div class="mt-5 font-weight-thin text-h4">{{ tt("user.ui.logout") }}</div>
        <div class="mt-5 text-body-2">
            {{ tt(texts.promptLogout) }}
        </div>
        <br />
        <LogoutButton :disabled="busy" size="large" :slim="false" rounded="xl" :text="logoutText" />
        -->

        <v-divider class="mb-7 mt-10" thickness="2" />
        <UpdateName :service="service" :disabled="busy" @busy="onBusy" />

        <v-divider class="mb-7 mt-10" thickness="2" />
        <UpdatePassword :service="service" :disabled="busy" @busy="onBusy" />
    </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

import Validators from "jsl/utils/Validators";
import { tt, TranslatedString } from "jsl/Localization";

import { userName, userNameShort } from "jsl/utils/Backend";
import { UserService } from "jsl/Backend";

import Form from "jsl/components/forms/Form.vue";

import BackButton from "jsl/components/BackButton.vue";
import Button from "jsl/components/Button.vue";
import LogoutButton from "jsl/components/user/LogoutButton.vue";

import UpdatePassword from "jsl/components/user/forms/UpdatePassword.vue";
import UpdateName from "jsl/components/user/forms/UpdateName.vue";
import EmailVerificationAlert from "jsl/components/user/EmailVerificationAlert.vue";

const props = defineProps({
    // Max width of this view - do NOT use "auto", "unset". If you do not care, set something like 99999px
    maxWidth: { type: String, default: "800px" },

    // The greet and message area below the titlebar
    title: { default: tt("common.msg.greet") },
    subtitle: { default: tt("common.msg.settingsAndProfileExplanation") },

    // Text for the logout button
    logoutText: { default: tt("user.ui.logout") },

    // Show the full name? If false, only the first word is used.
    fullUserName: { type: Boolean, default: true },

    // The user service to utilize
    service: { type: UserService, required: true },
});

const model = ref();

const emit = defineEmits([
    // When closing the profile view
    "close",

    // Updates on changes in the busy state. If a user profile form is busy, this triggers. Avoid closing the view while
    // busy!
    "busy",
]);

const busy = ref(false);

const texts = {
    promptLogout: new TranslatedString(
        "When logging out, you can't use your apps and tools anymore. You have to login again. Downloaded apps stay installed and can be used again after login.",
        {
            de: "Wenn du dich abmeldest, kannst du deine Apps und Tools nicht mehr nutzen. Du musst dich erneut anmelden. Heruntergeladene Apps bleiben erhalten und können nach dem Login wieder verwendet werden.",
        },
    ),
};

const uname = computed(() => {
    if (props.fullUserName) {
        return userName();
    }

    return userNameShort();
});

function onBack() {
    emit("close");
}

function onBusy(isBusy) {
    busy.value = isBusy;
    emit("busy", isBusy);
}
</script>
