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
            <pre v-html="fancyOutput" />
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
import { ref, watch, nextTick, onMounted, computed } from "vue";
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

const fancyOutput = computed(() => {
    const src = props.process?.state?.output || "";
    let result = "";
    var arr = src.split("\n");
    for (const line of arr) {
        if (line.startsWith("DBG")) {
            result += '<span class="jslConsoleDBGTag">DBG</span>' + line.slice(3) + "\n";
            continue;
        }

        if (line.startsWith("INF")) {
            result += '<span class="jslConsoleINFTag">INF</span>' + line.slice(3) + "\n";
            continue;
        }

        if (line.startsWith("WRN")) {
            result += '<span class="jslConsoleWRNTag">WRN</span>' + line.slice(3) + "\n";
            continue;
        }

        if (line.startsWith("ERR")) {
            result += '<span class="jslConsoleERRTag">ERR</span>' + line.slice(3) + "\n";
            continue;
        }

        result += line + "\n";
    }

    return result;
});

onMounted(() => {
    scrollToBottom();
});
</script>

<style>
.jslConsoleDBGTag {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
    padding-bottom: 3px;

    background: #1a1a1a;
    color: #999;
    font-weight: bold;
}
.jslConsoleINFTag {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
    padding-bottom: 3px;

    background: #2a2a2a;
    color: #ccc;
    font-weight: bold;
}
.jslConsoleWRNTag {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
    padding-bottom: 3px;

    background: #bc7931;
    color: #ddd;
    font-weight: bold;
}
.jslConsoleERRTag {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
    padding-bottom: 3px;

    background: #bd3e3e;
    color: #ddd;
    font-weight: bold;
}
</style>

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
    /*white-space: pre-wrap;
    word-wrap: break-word;*/
    overflow: auto;
    font-size: smaller;
}
</style>
