<!--
A RenderView that provides some basic error handling, loading panels and more.

<ProjectRenderView
    :initProject="initProject"
    :init="init"
>
   ...
</ProjectRenderView>

async function initProject(projectId) {
    return new MyProject();
    // Or ...
    return {
        name: "ProjectName",
        description: "ProjectDescription",
        logo: someImportedFile,
    };
}

// Init the renderer. Load the project and start the main view
async function init(project, canvasId, state) {
    await wait(500000);
}

-->
<template>
    <div>
        <Overlay
            v-model="initializing"
            v-bind="fwdBindProps('background', $props)"
            contentType="v-container"
            contentClass="pa-0"
            :contentProps="{ 'max-width': 1000 }"
        >
            <LoadingPanel
                :logo="state.logo"
                :title="state.title"
                :subtitle="state.subtitle"
                noAppLogo
                logoWidth="300px"
                logoHeight=""
                :defaultLogo="defaultLogo"
                :pending="state.initPending"
                :percent="state.initPercent"
            />
        </Overlay>

        <Overlay
            v-model="error"
            v-bind="fwdBindProps('background', $props)"
            contentType="v-container"
            contentClass="pa-0"
            :contentProps="{ 'max-width': 1000 }"
        >
            <v-icon size="6rem" color="error" style="align-self: end; justify-self: center" class="ma-5"
                >mdi-alert-circle-outline</v-icon
            >
            <div
                class="text-center"
                color="error"
                style="max-width: min(500px, 75vw); align-self: start; justify-self: center"
            >
                <span v-if="notFound">
                    {{ tt("common.msg.projectNotFound") }}
                </span>
                <span v-else>
                    {{ tt("common.msg.renderViewLoadError") }}
                </span>
                <template v-if="errorGuruCode">
                    <br />
                    <br />
                    <span class="text-grey-darken-1">
                        <b> {{ tt("common.msg.errorGuruCode", { error: errorGuruCode }) }} </b>
                    </span>
                </template>
            </div>
        </Overlay>

        <RenderView :canvasId="canvasId"> </RenderView>

        <slot />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, markRaw } from "vue";

import { fwdProps, fwdBindProps } from "jsl/utils/ForwardVueProps";

import { wait } from "jsl/utils/Await";

import { tt, TranslatedString } from "jsl/Localization";

import RenderView from "jsl/components/RenderView.vue";

import LoadingPanel from "jsl/components/utils/LoadingPanel.vue";

import Overlay from "jsl/components/Overlay.vue";

const props = defineProps({
    // If the project does not provide its own logo, use this instead. If this is also null, do not show any logo.
    defaultLogo: { default: null },

    // The project ID to load and render. This is passed as is to the initProject function.
    projectId: { type: String, default: null },

    // Allows to override the canvas ID used by the renderer
    canvasId: { type: String, default: "mainViewerCanvas" },

    // The background used for overlays like the loader
    ...fwdProps("background"),

    // The actual project loader function. This implements the fetch/load of the project from a backend or hard-coded
    // definition. This function gets the projectId as specified above and must return some object on success. Return
    // null/throw to trigger a "not found" error.
    initProject: {
        type: Function,
        default: async (projectId) => {
            console.error("No initProject handler given for project: ", projectId);
            throw "No initProject function defined";
        },
    },

    // This function handles the actual viewer initialization. This must be a async function that throws on error or
    // succeeds. The project as returned by initProject as well as the internal state is passed to control the loading
    // screen (progress, texts, ...). Whatever this function returns is passed to the "ready" emit.
    init: {
        type: Function,
        default: async (project, canvasId, state) => {
            console.error("No init handler given. ", project, canvasId, state);
            throw "No init function defined";
        },
    },
});

const emit = defineEmits([
    // Send once the viewer is initialized and ready.
    "ready",
]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Internal reactive states

const state = reactive({
    initPercent: -1,
    initPending: true,

    // Set the project title/subtitle/logo. If null, tried to derive from the project. See the init function for details
    title: null,
    subtitle: null,
    logo: null,
});

// Is true while the projects and the renderer is loading
const initializing = ref(true);
const notFound = ref(false);
const error = ref(false);
const errorGuruCode = ref("");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Functionality

// Init the renderer. Load the project and start the main view
async function init() {
    try {
        console.log("Initializing project render view for project ID: ", props.projectId);

        initializing.value = true;
        state.initPending = true;
        state.initPercent = -1;

        // 1. Load the project
        const _project = await props.initProject(props.projectId).catch((e) => {
            notFound.value = true;
            throw e;
        });
        if (_project == null) {
            notFound.value = true;
            error.value = true;
            return;
        }

        state.title =
            _project.title ||
            _project.title?.() ||
            _project.config?.title ||
            _project.name ||
            _project.name?.() ||
            _project.config?.name;
        state.subtitle =
            _project.subtitle ||
            _project.subtitle?.() ||
            _project.config?.subtitle ||
            _project.description ||
            _project.description?.() ||
            _project.config?.description;
        state.logo = _project.logo || _project.logo?.() || _project.config?.logo;

        // 2. Init viewer
        const result = await props.init(_project, props.canvasId, state);
        // Avoids some load flicker (not all textures in GPU mem for example)
        await wait(500);
        console.log("Project render view ready");

        emit("ready", result);

        initializing.value = false;
    } catch (e) {
        console.error(e);
        if (e.message == null && e.name == null) {
            errorGuruCode.value = e;
        } else {
            errorGuruCode.value = e.message + " (type: " + e.name + ")";
        }
        error.value = true;
    }
}

onMounted(async () => {
    return init();
});
</script>

<style scoped></style>
