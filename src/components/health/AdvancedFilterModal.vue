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
            <div v-if="item.next.length" class="filter-name">{{ item.title }}</div>
            <div class="filter-options">
              <div
                v-for="subItem in item.next"
                :key="subItem.id"
              >
                <label
                  class="option is-fullwidth"
                  :for="subItem.id"
                >
                  <input type="checkbox" :value="subItem" v-model="selectedFilters" :id="subItem.id">
                  {{ subItem.title }} <span v-if="subItem.next.length > 0" class="font-size-small">(Weitere Einträge)</span>
                </label>

                <div v-if="subItem.next.length > 0 && selectedFilters.includes(subItem)">
                  <label
                    v-for="tag in subItem.next"
                    class="option indent is-fullwidth"
                    :for="tag.id"
                    :key="tag.id"
                  >
                    <input
                      type="checkbox"
                      v-model="filterStore.currentTags"
                      :value="tag.id"
                      :id="tag.id"
                    />{{ tag.title }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ion-loading
        :is-open="loadingFilters"
        message="Filter werden geladen..."
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { FilterKind, useFilterStore } from "@/stores/health/searchFilter";
import { defineEmits, defineProps, ref, watch, computed } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonLoading } from '@ionic/vue';
import { CollapsibleListItem, EmitAction } from "../../../types/collapsibleList";

const filterStore = useFilterStore()
const advancedFilters = computed(() => {
  return useFilterStore().advancedFilters
})
const expandedItemIds = ref([]);

const selectedFilters = ref([])
const emit = defineEmits(["selectAdvancedFilter", "close"])

// use filter kind later to get the correct filter
// const props = defineProps<{
//   filterKind: FilterKind;
// }>();

const emitClose = () => {
  emit('close')
}

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
    filterStore.currentTags = filterStore.currentTags.filter((id) => id !== item.id);
  } else {
    filterStore.currentTags.push(item.id);
  }
};

const isSelected = (itemId: string) => {
  return filterStore.currentTags.includes(itemId);
};

const loadingFilters = ref(false)

watch(selectedFilters, () => {
  emit('selectAdvancedFilter', selectedFilters.value)
})

</script>

<style lang="sass" scoped>
.filters .option
  display: block
  padding: 0px 10px 11px 10px
  margin-top: 10px
  &.indent
    margin-left: 10%
    width: 90%
</style>