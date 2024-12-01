<template>
    <div class="imageUploader">
        <label class="imageBox ma-7" for="imgUpload">
            <v-img :src="imageURL" :width="imgWidth" :height="imgHeight" />
        </label>
        <v-file-input
            id="imgUpload"
            show-size
            :accept="acceptsTypes"
            :label="tt('common.ui.uploadX', { what: what }).toString()"
            :prepend-icon="icon"
            :rules="[Validators.maxFileSize(maxSize)]"
            :name="name"
            v-model="model"
        />
        <p class="text-medium-emphasis text-right text-caption mt-0 mb-3">
            {{ tt("form.prompt.allowedFileTypes", { what: ftypes }) }}.
            {{ tt("form.prompt.maxAllowedSize", { what: maxSize }) }}.
        </p>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";

import { tt, Translatable, localization } from "jsl/Localization";

import Validators from "jsl/utils/Validators";

const props = defineProps({
    // The name to use to identify the value
    name: { type: String, required: false, default: "file" },

    // What to upload. This constructs the label "Upload X"
    what: { type: [String, Translatable], default: null },

    // The icon to show. Set to null to disable
    icon: { type: String, default: "mdi-paperclip" },

    // Max file size in MB
    maxSize: { type: Number, default: 1 },

    // The width and height of the image box.
    imgWidth: { type: String, default: "250px" },
    // The width and height of the image box.
    imgHeight: { type: String, default: "250px" },

    // The default to use. Should be an URL or blob-url
    defaultImage: null,

    // The accepted file types
    filetypes: { type: Array, default: ["png", "jpeg", "webp"] },
});

const model = defineModel();

watch(model, (newValue, oldValue) => {
    emit("imageUpdate", imageURL.value);
});

const emit = defineEmits([
    // Called whenever the shown image URL updates. Use this to get the image URL or the default if not upload is defined.
    // Ideal to keep some image somewhere in sync with the image shown in the preview.
    "imageUpdate",
]);

const imageURL = computed(() => {
    if (model.value != null) {
        return URL.createObjectURL(model.value);
    }
    return props.defaultImage;
});

const acceptsTypes = computed(() => {
    return Array.from(props.filetypes, (x) => "image/" + x).join(", ");
});

const ftypes = computed(() => {
    return props.filetypes.join(", ");
});
</script>

<style scoped>
.imageUploader {
}

.imageBox {
    display: block;
    justify-self: center;

    max-width: v-bind(imgWidth);
    max-height: v-bind(imgHeight);
    background: conic-gradient(#cccccc 90deg, #aaaaaa 90deg 180deg, #cccccc 180deg 270deg, #aaaaaa 270deg);
    background-repeat: repeat;
    background-size: 60px 60px;
    background-position: top left;
}

.imageBox .v-img {
}
</style>
