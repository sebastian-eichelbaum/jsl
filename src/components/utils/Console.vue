<template>
    <v-card :loading="process?.state?.running" id="container" v-bind="{ ...$props, ...$attrs }" :title="null">
        <v-toolbar density="comfortable" color="surface">
            <v-icon class="ml-5">mdi-bash</v-icon>
            <v-toolbar-title class="font-weight-medium">
                {{ title }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>

            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-filter" />
                </template>
                <v-list>
                    <v-list-item @click="() => onFilter('debug')">
                        <v-list-item-title>Debug</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="() => onFilter('info')">
                        <v-list-item-title>Info</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="() => onFilter('warn')">
                        <v-list-item-title>Warning</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="() => onFilter('error')">
                        <v-list-item-title>Error</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-btn icon="mdi-content-copy" @click="onCopyToClipboard" />
            <v-btn v-if="backend.bugReport != null" icon="mdi-bug" @click="onSendReport" />
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

        <SendBugReport ref="bugReporter" />
    </v-card>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from "vue";

import { ChildProcess } from "jsl/platforms/electron/ChildProcess";
import { tt } from "jsl/Localization";
import { backend } from "jsl/Backend";

import SendBugReport from "jsl/components/utils/SendBugReport.vue";

const props = defineProps({
    // Title to show
    title: { type: String, default: "common.ui.console" },

    // The process
    process: { type: ChildProcess, default: null },

    maxHeight: { default: "400px" },
    minHeight: { default: "400px" },

    // Log below this level are not printed. Allowed: "error", "warn", "info", "debug",
    // If the user explicitly defines a filter level, this value is ignored.
    minLogLevel: { type: String, default: "info" },

    // If set, do not print messages that do not start with a log level tag.
    skipUntagged: { type: Boolean, default: false },
});

const stdoutPre = ref();

const bugReporter = ref();
const filterLevel = ref();

function onFilter(value) {
    filterLevel.value = value;
}

function onCopyToClipboard() {
    navigator.clipboard.writeText(props.process?.output);
}

async function onSendReport() {
    return bugReporter.value.sendReport({
        attachments: [{ name: tt("common.ui.consoleLog").toString(), data: props.process?.output || "no output" }],
    });
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

const minLogLevel = computed(() => {
    const levelAsNum = (asString) => {
        switch (asString) {
            case "debug":
                return 0;
            case "info":
                return 1;
            case "warn":
                return 2;
            case "error":
                return 3;
            default:
                return -1;
        }
    };

    const filterLevelNum = levelAsNum(filterLevel.value);
    if (filterLevelNum >= 0) {
        return filterLevelNum;
    }

    return levelAsNum(props.minLogLevel);
});

const fancyOutput = computed(() => {
    const src = props.process?.state?.output || "";
    let result = "";
    var arr = src.split("\n");
    for (const line of arr) {
        if (line.startsWith("DBG") || line.startsWith("---")) {
            if (minLogLevel.value > 0) {
                continue;
            }

            result += '<span class="jslConsoleDBGTag">DBG</span>' + line.slice(3) + "\n";
            continue;
        }

        if (line.startsWith("INF")) {
            if (minLogLevel.value > 1) {
                continue;
            }
            result += '<span class="jslConsoleINFTag">INF</span>' + line.slice(3) + "\n";
            continue;
        }

        if (line.startsWith("WRN")) {
            if (minLogLevel.value > 2) {
                continue;
            }
            result += '<span class="jslConsoleWRNTag">WRN</span>' + line.slice(3) + "\n";
            continue;
        }

        if (line.startsWith("ERR")) {
            if (minLogLevel.value > 3) {
                continue;
            }

            result += '<span class="jslConsoleERRTag">ERR</span>' + line.slice(3) + "\n";
            continue;
        }

        if (props.skipUntagged) {
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

    height: 100%;
}
</style>
