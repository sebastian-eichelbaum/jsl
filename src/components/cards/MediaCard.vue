<!--
Represents a typical media card that shows an image, title and a play button.

Slots:

* default {isHovering}: Main card content above the footer area
* footer {isHovering}: The footer area as v-card-actions. By default, this provides the slots
    * title: Contains title and subtitle as delivered via properties
    * chips: An area below the title that can be used for chips or actions
    * actions: A small area suited for a single button on the right.
* overlay: from Card, shows an overlay on top of the card

Example:

<MediaCard
    v-for="card in cards"
    :title="card.name"
    :subtitle="tt('common.ui.greet')"
    :image="card.thumbnailURL"
    overlayOnHover
>

    <p>Arbitrary content</p>

    <template #chips="{ isHovering }">
        <v-chip :variant="isHovering ? 'outlined' : 'tonal'">V: 13.2.1</v-chip>&nbsp;
    </template>

    <template #actions>
        <Button color="primary" size="x-large" variant="flat" :slim="false" rounded="xl" icon="mdi-play"
        @click.stop="onMenuBtn" // use stop or the card will capture the click too!
        />
    </template>

    <template #overlay>
        <p>Hello!</p>
    </template>
</MediaCard>

-->
<template>
    <Card v-bind="{ ...$props, ...$attrs }" :title="null" :subtitle="null" :image="null">
        <template v-slot:default="{ isHovering }">
            <v-img
                :src="image"
                class="align-end"
                :gradient="
                    image != null
                        ? 'to bottom, rgba(0,0,0,.1), rgba(0,0,0,.3), rgba(0,0,0,.5), rgba(0,0,0,.80), rgba(0,0,0,.95), rgba(0,0,0,1)'
                        : ''
                "
                height="100%"
                cover
            >
                <slot :isHovering="isHovering" />

                <v-card-actions class="mr-4 ml-4 mb-4">
                    <slot name="footer" :isHovering="isHovering">
                        <v-row justify="space-between">
                            <v-col align-self="center" :cols="!!$slots.actions ? minChipCols : 12">
                                <slot name="title" :isHovering="isHovering">
                                    <v-card-title class="pa-0 ma-0">
                                        {{ tt(title) }}
                                    </v-card-title>

                                    <v-card-subtitle class="pa-0 ma-0" vif="subtitle">
                                        {{ tt(subtitle) }}
                                    </v-card-subtitle>
                                </slot>

                                <!-- Creates a small margin if chips are present -->
                                <div v-if="!!$slots.chips" class="pa-0 ma-0 mt-2"></div>
                                <slot name="chips" :isHovering="isHovering">
                                    <!--
                                        <v-chip variant="flat" color="primary">Aktiv: 01.03.24 - 01.03.25</v-chip>&nbsp;
                                        <v-chip variant="tonal">V: 13.2.1</v-chip>&nbsp;
                                    -->
                                </slot>
                            </v-col>
                            <v-col align-self="end" cols="auto" v-if="!!$slots.actions">
                                <slot name="actions" :isHovering="isHovering">
                                    <!--
                                    <Button color="primary" size="x-large" variant="flat" :slim="false" rounded="xl"/>
                                    -->
                                </slot>
                            </v-col>
                        </v-row>
                    </slot>
                </v-card-actions>
            </v-img>
        </template>

        <!-- Also remember: Card offers a nice #overlay-->
        <template #overlay>
            <slot name="overlay" />
        </template>
    </Card>
</template>

<script setup>
import { computed } from "vue";

import { tt } from "jsl/Localization";
import { vuetify } from "jsl/Vuetify";

import Card from "jsl/components/cards/Card.vue";
import Button from "jsl/components/Button.vue";
import Placeholder_Media from "jsl/assets/Placeholder_Media.svg";

const props = defineProps({
    // Media cover image
    image: { type: String, default: Placeholder_Media },

    // Title to show
    title: { default: tt("common.msg.todo", { what: "title!" }) },
    subtitle: { default: null },

    // ... and the Card props.

    // Subtle ripple works nice with media cards.
    ripple: { default: { class: "text-background" } },

    // When there are actions, the chip column gets smaller. This is the num of columns.
    minChipCols: { type: Number, default: 9 },
});

const emit = defineEmits(["click"]);

const onClick = () => {
    // Just forward?
    emit("click");
};
</script>
