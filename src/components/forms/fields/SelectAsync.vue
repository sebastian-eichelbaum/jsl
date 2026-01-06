<!--
A v-select with autocomplete that allows to select items dynamically loaded from an API. It fetches the data according
to the given search text and allows the user to select items.


Slots:
* #chip={props, item} - allows to customize the chip that is shown in the input when something is selected.
* #item={props, item} - allows to customize the menu contents. Use v-list-item as wrapper for menu style list.
* #itemDetails={item} - allows to customize the details section of the default item slot. Only used if #item is not
    provided.

Example:

<Form
    ... // see jsl Form
>
    <template v-slot="{ busy, model }">
        <Field
            ... // see jsl Field
            :fieldType="SelectAsync" // Choose SelectAsync
            :fieldProps="selectAsyncProps" // Set props
        >
            // Provide some details if needed.
            <template v-slot:itemDetails="{ item }">
                <span class="ma-0 pa-0 text-truncate text-body-2"> G: {{ item.raw.field1 }} </span>
                <br />
                <span class="ma-0 pa-0 text-truncate text-body-2"> E: {{ item.raw.field2 }} </span>
            </template>
            // For more control on chip and list design, override #chip and #item

        </Field>
    </template>
</Form>
-->

<template>
    <div id="menuHere">
        <v-autocomplete
            v-bind="{ ...$props, ...$attrs }"
            item-props=""
            no-filter
            :items="items.results"
            v-model="model"
            @update:search="debouncedFetch"
            :loading="isLoading"
            :no-data-text="noDataText.toString()"
            :menu-props="menuProps"
        >
            <template v-slot:chip="{ props, item }">
                <slot name="chip" :props="{ ...props, ..._chipProps }" :item="item">
                    <v-chip
                        v-bind="{ ...props, ..._chipProps }"
                        :color="item.raw._selectAsync_mapped?.color || { ...props, ..._chipProps }.color"
                        :prepend-icon="item.raw._selectAsync_mapped?.icon || { ...props, ..._chipProps }.icon"
                    >
                        <span class="text-truncate font-weight-bold">
                            {{ interpretTitle(item.raw._selectAsync_mapped) }}
                        </span>
                        <span
                            class="text-truncate font-weight-light text-subtitle-2"
                            v-if="item.raw._selectAsync_mapped?.description"
                        >
                            &nbsp;({{ item.raw._selectAsync_mapped?.description }})
                        </span>
                    </v-chip>
                </slot>
            </template>

            <template v-slot:item="{ props, item }">
                <slot name="item" :props="props" :item="item">
                    <!-- Important: override title to avoid automatic title generation by vuetify -->
                    <v-list-item v-bind="{ ...props, ...itemProps }" title="">
                        <template v-slot:prepend v-if="!$slots['item'] && item.raw._selectAsync_mapped?.icon">
                            <v-icon :icon="item.raw._selectAsync_mapped?.icon"></v-icon>
                        </template>

                        <v-list-item-title>
                            <span class="text-truncate font-weight-bold">
                                {{ interpretTitle(item.raw._selectAsync_mapped?.title) }}
                            </span>
                            <span
                                class="text-truncate font-weight-light text-subtitle-2"
                                v-if="item.raw._selectAsync_mapped?.description"
                            >
                                &nbsp;({{ item.raw._selectAsync_mapped?.description }})
                            </span>
                        </v-list-item-title>

                        <v-list-item-subtitle>
                            <span class="text-truncate text-subtitle-2" v-if="item.raw._selectAsync_mapped?.subtitle">
                                {{ item.raw._selectAsync_mapped?.subtitle }}
                            </span>
                        </v-list-item-subtitle>
                        <slot name="itemDetails" :item="item">
                            <span
                                v-if="item.raw._selectAsync_mapped?.details"
                                class="text-body-2"
                                v-html="item.raw._selectAsync_mapped?.details"
                            >
                            </span>
                        </slot>
                    </v-list-item>
                </slot>
            </template>
        </v-autocomplete>
    </div>
</template>

<script>
function aaa() {}
</script>

<style scoped>
.v-list-item:nth-child(even) {
    backdrop-filter: brightness(1.1);
}

.v-list-item:nth-child(odd) {
    backdrop-filter: brightness(1);
}
</style>

<script setup>
import { ref, reactive, markRaw, watch } from "vue";

import _ from "lodash";

import { tt, Translatable } from "jsl/Localization";

import { fwdProps, fwdBindProps } from "jsl/utils/ForwardVueProps";

import { DatabaseService } from "jsl/Backend";
import Validators from "jsl/utils/Validators";
import { makeDebouncedSingleRun } from "jsl/utils/Await";

import Field from "jsl/components/forms/Field.vue";

const model = defineModel();
watch(model, (newVal, oldVal) => {
    mapData(newVal);
});

const props = defineProps({
    // By default, selects should clear the search once an item is selected.
    "clear-on-select": { tpye: Boolean, default: true },
    // Allow selection of multiple items?
    // NOTE: has to be present here as it is queried in the fwdBindProps later. If removed, it will be undefined
    multiple: { tpye: Boolean, default: false },

    // Text to show if there is no data (yet)
    noDataText: { type: [String, Translatable], default: tt("common.msg.noDataAvailable") },

    // The service to use
    service: { type: DatabaseService, required: true },

    // Fetch limit
    limit: { type: Number, default: 50 },

    // Debounce time in ms
    debounce: { type: Number, default: 500 },

    // The collection to search
    collection: { type: String, required: true },

    // The fields to search
    fields: { type: Array, required: true },

    // A filter function to apply after fetching the results. For each entry in the result list, this is called. If it
    // returns true, the data is kept.
    filter: { type: Function, required: false, default: null },

    // A function that maps the data that is returned by your query to a usable ID, name, description and color, ...
    //
    // Name: Be aware that, once clicked on the field again, this name is also used as search term. You might want to
    // use something that represents a search that yields this data again. By default, it uses
    // "name, title, id, uid, key, '<unmapped>'", whatever is non-nullish first.
    //
    // NOTE: This t not be nullish
    //
    // Possible accepted keys: see default
    mapData: {
        type: Function,
        default: (data) => {
            return {
                // A unique ID that identifies this. This is used to identify items. Due to how vuetify handles
                // v-autocomplete, this is also the initial search when re-selecting a field with a value. So, you should
                // make sure that this value is a valid search term that yields the same item again.
                // NOTE: this is mandatory.
                // THIS IS NOT the model value or v-autocomplete! Use
                id: data?.id || data?.uid || data?.key,

                // The title to show in the chip and as text value inside the input.
                // NOTE: this is mandatory. Everything else is optional.
                title: (data?.name || data?.title || data?.id || data?.uid || data?.key || "<unmapped>").toString(),

                // An optional subtitle to show in the default item slot below the title. If undefined, nothing is shown
                subtitle: undefined,

                // A description. If present, this is appended to the title in the default chip and default item slots
                description: undefined,

                // More detailled information. Will be shown in the default item slot
                details: undefined,

                // An icon to show in the default chip slot if present. Overrides the icon that might be given in the
                // chipProps.
                icon: undefined,
                // A color to use for the default chip/item slot if present. Overrides the color that might be given in
                // chipProps.
                color: undefined,

                // NOTE: this allows quite some customization of the default chip. If you need more, consider providing
                // a custom chip <template #chip={...}>
            };
        },
    },

    // The data field to use as value for the model (and the v-autocomplete value to show). If null, the data has to
    // a field "title". Else, has to be a function (data)=>{return data.something;}.
    // NOTE: this modifies the "title" value in the original data. The original title is stored in "__title"
    modelValueMap: { default: null },

    // Properties that are passed to the generated chip for a data element
    ...fwdProps("chipProps"),

    // The item props to forward to each generated item in the selection menu
    ...fwdProps("itemProps"),
});

const debouncedFetch = makeDebouncedSingleRun(fetchData, props.debounce);

const isLoading = ref(false);

// The menu unfortunately takes the size it needs for the content, even exceeding the component width.
// To avoid this, attach the menu to this field's container div.
const menuProps = reactive({
    attach: "#menuHere",
    absolute: true,
});

// Default props for generated chips
const _chipProps = fwdBindProps("chipProps", props, (allProps, fwdProps) => {
    return {
        // False by default as it is mostly useful for multiple-selections.
        closable: allProps?.multiple || false,

        size: "large",
        variant: allProps?.multiple ? undefined : "text",
    };
});

function interpretTitle(mappedData) {
    if (typeof mappedData === "string" || mappedData instanceof String) {
        return mappedData;
    }
    return mappedData?.title || "<???>";
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API IO

// Tracks the loaded items
const items = reactive({ results: [] });
// The last conducted search
let lastSearch = "";

async function fetchData(newVal) {
    isLoading.value = true;

    try {
        // Be sure there is a service
        if (props.service == null) {
            throw new Error("Service instance is null");
        }
        if (props.mapData == null) {
            throw new Error("mapData is null");
        }

        // be sure that there has been a change. Also, this is called once the model value is inserted into the text
        // field after selection -> would trigger unnecessary reload.
        if (lastSearch == newVal || newVal == model.value) {
            isLoading.value = false;
            return;
        }
        lastSearch = newVal;

        if (!newVal) {
            isLoading.value = false;
            return;
        }

        const segmenter = new Intl.Segmenter([], { granularity: "word" });
        const segmentedText = segmenter.segment(newVal);
        const words = [...segmentedText].filter((s) => s.isWordLike).map((s) => s.segment);

        if (words.length < 1) {
            clear();
            return;
        }

        // If there is a filter function, the amount of data to load is "all". Then apply the filter, then limit.
        const loadLimit = typeof props.filter == "function" ? 999999 : props.limit;

        await props.service
            .search(props.collection, props.fields, words, {
                limit: loadLimit > 0 ? loadLimit : 999999,
            })
            .then((data) => {
                return (
                    data
                        .filter(typeof props.filter == "function" ? props.filter : (e) => true)
                        // Keep the requested amount
                        .slice(0, props.limit > 0 ? props.limit : -1)
                );
            })
            .then(mapData)
            .catch((e) => {
                console.error("Database backend error");
                throw e;
            });
    } catch (e) {
        console.error("fetchData failed", e);
        clear();
    }

    isLoading.value = false;
}

function mapData(data) {
    if (!Array.isArray(data)) {
        // console.log("unmapped");
        // This only works for array data after fetching it. Non "multiple=true" selects do not store the source data as
        // array in their model, only the "title" of the data.
        // TODO: is there a way to make this work for single-selects?
        return;
    }

    items.results = Array.from(data, (dat) => {
        // console.log("mapping", dat);
        dat["_selectAsync_mapped"] = props.mapData(dat);
        dat["toString"] = () => dat._selectAsync_mapped.id;
        if (typeof props.modelValueMap == "function") {
            dat["__title"] = dat["title"];
            dat["title"] = props.modelValueMap(dat);
        }
        return markRaw(dat);
    });
}

// Clear the result list
function clear() {
    isLoading.value = false;
    items.results.splice(0);
}
</script>
