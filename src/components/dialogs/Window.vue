<!--
Windows are ModalDialogs that have a title bar, an optional "greeter" and scale responsively.

Use windows for more complex dialogs. The plain ModalDialog is good for questions and short info popups.
-->

<template>
    <ModalDialog v-model="model" @close="onClose" v-bind="{ ...$props, ...$attrs }">
        <v-toolbar density="comfortable" color="primary-darken-3">
            <v-icon v-if="icon" class="ml-5">{{ icon }}</v-icon>
            <v-toolbar-title class="font-weight-medium">
                {{ title }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="doClose">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-toolbar>

        <v-card-item v-if="!noGreetBox" :style="greetBoxStyle" class="pb-5 pt-5">
            <v-card-title>
                {{ tt(greetText) }}
            </v-card-title>
            <v-card-subtitle class="text-wrap">{{ tt(greetSubtext) }}</v-card-subtitle>
        </v-card-item>

        <slot>
            <v-card-item class="pt-5 pb-5">
                {{ tt("common.msg.sid") }}
            </v-card-item>
            <v-card-actions>
                <v-spacer />
                <!-- Buttons in actions get the "slim" property set which makes them more compact but looks ugly
                        with icons! -->
                <Button
                    :slim="false"
                    icon="mdi-hand-wave"
                    :text="new Translatable('common.msg.greet', { user: 'User' })"
                />
            </v-card-actions>
        </slot>
    </ModalDialog>
</template>

<script setup>
import { computed } from "vue";

import { tt } from "@jsl/Localization";

import ModalDialog from "@jsl/components/dialogs/ModalDialog.vue";
import Button from "@jsl/components/Button.vue";

const model = defineModel();

const props = defineProps({
    // Dialog max width.
    maxWidth: { default: 500 },

    // Titlebar
    icon: { default: "mdi-cog" },
    title: { default: tt("common.msg.todo", { what: "title!" }) },

    // The greet and message area below the titlebar
    greetText: { default: tt("common.msg.todo", { what: "greetText!" }) },
    greetSubtext: { default: tt("common.msg.todo", { what: "greetSubtext!" }) },
    // Disable the greet box?
    noGreetBox: { type: Boolean, default: false },
    // The brightness of the box. If > 1, it gets brighter
    greetBrightness: { type: Number, default: 0.66 },
});

function doClose() {
    model.value = false;
}

function onClose() {
    model.value = false;
}

const greetBoxStyle = computed(() => {
    return "backdrop-filter: brightness(" + props.greetBrightness + ");";
});
</script>