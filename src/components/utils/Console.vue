<template>
    <v-card :loading="process?.state?.running" id="container" v-bind="{ ...$props, ...$attrs }" :title="null">
        <v-toolbar density="comfortable" color="surface">
            <v-icon class="ml-5">mdi-bash</v-icon>
            <v-toolbar-title class="font-weight-medium">
                {{ title }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-content-copy" @click="onCopyToClipboard" />
        </v-toolbar>

        <component is="pre" id="stdout" ref="stdoutPre" class="jslapp-custom-scrollbar-html">
            {{ process?.state?.output }}
            <div style="color: rgba(255, 255, 255, 0.3)">
                &gt;
                <span v-if="process?.state?.completed && !process?.state?.failed" class="text-success font-weight-bold">
                    OK: {{ process?.state?.returnCode }}
                </span>
                <span v-if="process?.state?.completed && process?.state?.failed" class="text-error font-weight-bold">
                    FAILED: {{ process?.state?.returnCode }}
                </span>
            </div>
        </component>
    </v-card>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import { ChildProcess } from "@jsl/platforms/electron/ChildProcess";

const props = defineProps({
    // Title to show
    title: { type: String, default: "Console" },

    // The process
    process: { type: ChildProcess, default: null },

    maxHeight: { default: "400px" },
    minHeight: { default: "400px" },
});

const stdoutPre = ref();

function onCopyToClipboard() {
    navigator.clipboard.writeText(props.process?.output);
}

// Track changes in the model to handle scroll
watch(
    () => props.process?.output,
    (newValue, oldValue) => {
        scrollToBottom();
    },
    { immediate: true },
);

function scrollToBottom() {
    nextTick().then(() => {
        stdoutPre?.value?.scrollBy({
            top: 100000,
            behavior: "smooth",
        });
    });
}

onMounted(() => {
    scrollToBottom();
});
</script>

<style scoped>
#container {
    background: rgba(0, 0, 0, 0.6);

    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
    justify-content: flex-start;
}

#stdout {
    display: block;

    padding: 1em;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: auto;
    font-size: smaller;
}
</style>
