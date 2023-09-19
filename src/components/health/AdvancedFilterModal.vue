<template>
  <ion-modal :is-open="true" :can-dismiss="true">
    <ion-header>
      <ion-toolbar>
        <ion-title>Filter</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emitClose()">Schließen</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div v-if="!loadingFilters" class="filters">
        <div v-for="filter in advancedFilters" :key="filter.key">
          <div v-for="item in filter.next" :key="item.id">
            <div v-if="item.next.length" class="filter-name">
              {{ item.title.replace("(nur von ärztlichen/ therapeutischen Leistungserbringern auszuwählen)", "") }}
            </div>
            <div class="filter-options">
              <div v-for="subItem in item.next" :key="subItem.id">
                <label class="option is-fullwidth" :for="subItem.id" @click.prevent="toggleSelection(subItem)">
                  <input
                    type="checkbox"
                    :checked="selectedFilters.includes(subItem.id)"
                    :id="subItem.id"
                    :class="[!subItem?.next?.length ? '' : 'invisible']"
                  />
                  {{ subItem.title }}
                </label>

                <div v-if="subItem.next.length > 0">
                  <label v-for="tag in subItem.next" class="option indent is-fullwidth" :for="tag.id" :key="tag.id" @click.prevent="toggleSelection(tag)">
                    <input type="checkbox" :checked="selectedFilters.includes(tag.id)" :value="tag.id" :id="tag.id" />{{ tag.title }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="gap-1" />
      <div class="gap-1" />
      <div class="gap-1" />
      <div class="gap-1" />
      <div class="gap-1" />
      <ion-loading :is-open="loadingFilters" message="Filter werden geladen..." />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { FilterKind, useFilterStore } from "@/stores/health/searchFilter";
import { defineEmits, defineProps, ref, watch, computed, onMounted } from "vue";
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonLoading, onIonViewDidEnter } from "@ionic/vue";
import { CollapsibleListItem } from "@/types/collapsibleList";

const props = defineProps<{
  modelValue: string[];
  filterKind: FilterKind;
}>();

const advancedFilters = computed(() => {
  return useFilterStore().advancedFilters;
});
const expandedItemIds = ref([]);

const selectedFilters = ref([]);
const emit = defineEmits(["update:modelValue", "close"]);

const emitClose = () => {
  emit("close");
};

const toggleSelection = (item: CollapsibleListItem) => {
  if (item.next?.length) {
    const index = expandedItemIds.value.findIndex((expandedItemId) => expandedItemId === item.id);

    if (index === -1) {
      expandedItemIds.value.push(item.id);
    } else {
      expandedItemIds.value.splice(index, 1);
    }
    return;
  }

  if (isSelected(item.id)) {
    selectedFilters.value = selectedFilters.value.filter((id) => id !== item.id);
  } else {
    selectedFilters.value.push(item.id);
  }

  emit("update:modelValue", selectedFilters.value);
};

const isSelected = (itemId: string) => {
  return selectedFilters.value.includes(itemId);
};

const loadingFilters = ref(false);

// watch(selectedFilters, () => {
//   emit('update:modelValue', selectedFilters.value)
// })

onMounted(async () => {
  selectedFilters.value = [...props.modelValue];
  loadingFilters.value = true;
  await useFilterStore().getItems(props.filterKind);
  loadingFilters.value = false;
});
</script>

<style lang="sass" scoped>
.filters .option
  display: block
  padding: 0px 10px 11px 10px
  margin-top: 10px

  .invisible
    opacity: 0
    width: 0

  &.indent
    margin-left: 10%
    width: 90% !important
</style>
