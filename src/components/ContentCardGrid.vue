<template>
    <CardGrid
        size="x-large"
        :aspect="2 / 1"
        titleClasses="text-h2 font-weight-thin jsl-font-montserrat"
        class="mt-10 mb-10"
        v-bind="{ ...$props, ...$attrs }"
        :titleActions="titleActions"
        :actionCards="actionCards"
        v-if="!(hideIfEmpty && isEmpty)"
    >
        <component
            v-for="item in mappedContent"
            :key="item"
            :is="item.component"
            v-bind="{ ...contentCardProps, ...item.props }"
            v-on="{ ...item.eventHandlers }"
        />
    </CardGrid>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

import CardGrid from "jsl/components/CardGrid.vue";

const props = defineProps({
    // If true, the component will not render if there is no content to show. This works regardless of the action cards
    // that might be present.
    hideIfEmpty: { type: Boolean, default: false },

    // The props to apply to each content card
    contentCardProps: { default: {} },

    // Content descriptor that matches this definition:
    content: {
        type: Object,
        default: {
            // Called when the user requests to refresh the content list
            onRefresh: null,
            // Called when the user wants to add content.
            onAdd: null,
            // A vue bool ref that is true while the app is refreshing
            isRefreshing: null,
            // A vue bool ref that is true while the app is adding
            isAdding: null,

            // An array of things to show. Type is arbitrary. It has to be handled by dataMap.
            data: [],
            // A function that maps the given item from the data array to {component, props, eventHandlers}. Props are
            // passed as pros via v-bind. Event handlers are passed via v-on.
            // (item) => {
            //     return { component: VideoCard, props: { class: "mt-10", ... }, eventHandlers: { click: ()=>{...}, )} };
            // },
            dataMap: null,
        },
    },
});

const isEmpty = computed(() => {
    return props.content?.data == null || props.content.data.length === 0;
});

const mappedContent = computed(() => {
    return Array.from(props.content.data, (x) => {
        if (props.content?.dataMap == null) {
            return x;
        }
        return props.content.dataMap(x);
    });
});

const titleActions = computed(() => {
    return [
        {
            icon: "mdi-refresh",
            props: {},
            loading: props.content?.isRefreshing,
            onClicked: () => {
                if (props.content?.onRefresh == null) {
                    console.log("Provide onRefresh in your content definition.");
                    return;
                }
                props.content.onRefresh();
            },
        },
    ];
});

const actionCards = computed(() => {
    return [
        {
            icon: "mdi-plus",
            props: {},
            loading: props.content?.isAdding,
            onClicked: () => {
                if (props.content?.onAdd == null) {
                    console.log("Provide onAdd in your content definition.");
                    return;
                }
                props.content.onAdd();
            },
        },
    ];
});

// Load on startup
onMounted(() => {
    props.content?.onRefresh?.();
});
</script>
