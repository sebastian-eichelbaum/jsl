<template>
    <v-divider :thickness="1" class="border-opacity-10 ml-1 mr-1" color="#aaaaaa88" vertical v-if="dividerL" />

    <Button v-bind="{ ...$props, ...$attrs }" color :icon="isLocked ? iconLocked : iconUnlocked" :disabled="isDisabled">
        <PinDialog
            v-model="dialog"
            activator="parent"
            v-bind="fwdBindProps('pinDialogProps', $props)"
            :icon="isLocked ? iconLocked : iconUnlocked"
            :title="isLocked ? unlockTitle : lockTitle"
            :pinText="isLocked ? unlockPinText : lockPinText"
            :greetText="greetText"
            :greetSubtext="greetSubtext"
            :noGreetBox="isLocked"
            @submit="onSubmit"
        />
    </Button>

    <v-divider :thickness="1" class="border-opacity-10 ml-1 mr-1" color="#aaaaaa88" vertical v-if="dividerR" />
</template>

<script setup>
import { ref, computed } from "vue";

import Button from "@jsl/components/Button.vue";
import PinDialog from "@jsl/components/dialogs/PinDialog.vue";

import { FeatureLock } from "@jsl/FeatureLock";
import { tt } from "@jsl/Localization";

import { fwdProps, fwdBindProps } from "@jsl/utils/ForwardVueProps";

const props = defineProps({
    // The feature lock to control.
    featureLock: { type: FeatureLock, required: true, default: null },

    iconUnlocked: { default: "mdi-lock-open" },
    iconLocked: { default: "mdi-lock" },

    variant: { default: "text" },

    // Add a divider to the right?
    dividerR: { type: Boolean, required: false, default: false },
    // Add a divider to the left?
    dividerL: { type: Boolean, required: false, default: true },

    // Pin Dialog title when locking/unlocking
    unlockTitle: { default: tt("common.ui.unlock") },
    lockTitle: { default: tt("common.ui.lock") },

    // The greet and message area below the titlebar
    greetText: { default: tt("common.msg.unattendedModeLock", { what: "wurstgreetText or noGreetBox!" }) },
    greetSubtext: {
        default: tt("common.msg.unattendedModeLockExplanation", { what: "wurstgreetSubtext or noGreetBox!" }),
    },

    // The text to show above the pin entry when locking/unlocking
    lockPinText: { default: tt("common.prompt.enterLockPin") },
    unlockPinText: { default: tt("common.prompt.enterUnlockPin") },

    // Properties to pass to the created input field
    ...fwdProps("pinDialogProps"),
});

const dialog = ref(false);

const isLocked = props?.featureLock?.locked || false;

const isDisabled = computed(() => props.featureLock == null);

// Called by the JSL form in PinDialog.
async function onSubmit(state) {
    await state.action(async (state) => {
        if (props.featureLock == null) {
            throw new Error("FeatureLock is null");
        }
        console.log(props.featureLock)

        return (
            props.featureLock.locked.value
                ? props.featureLock.unlock(state.values.pin)
                : props.featureLock.lock(state.values.pin, true)
        ).then(() => {
            dialog.value = false;
        });
    });
}

</script>

<style scoped></style>
