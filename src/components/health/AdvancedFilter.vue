<template>
  <ion-content class="ion-padding-bottom">
    <div v-if="!loadingFilters" class="filters">
      <div v-for="filter in advancedFilters" :key="filter.key">
        <div v-for="item in filter.next" :key="item.id">
          <div class="divider"></div>
          <div
            v-if="item.next.length"
            class="filter-name general-font-size-subtitle is-dark-grey"
          >
            {{
              item.title.replace(
                "(nur von ärztlichen/ therapeutischen Leistungserbringern auszuwählen)",
                ""
              )
            }}
          </div>
          <div class="filter-options ion-padding-bottom">
            <div v-for="subItem in item.next" :key="subItem.id" class="option">
              <label :for="subItem.id"  >
                <div
                  :model-value="modelValue.includes(subItem.id)"
                  @click.prevent="toggleSelection(subItem)"
                  hide-details
                  density="compact"
                  class="options-select general-font-size"
                  :class="{
                    'is-selected': selectedFilters.includes(subItem.id),
                  }"
                >
                  {{ subItem.title }}
                </div>
              </label>

              <div v-if="subItem.next.length > 0">
                <label
                  v-for="tag in subItem.next"
                  class="option indent is-fullwidth"
                  :for="tag.id"
                  :key="tag.id"
                >
                  <input
                    type="checkbox"
                    :checked="selectedFilters.includes(tag.id)"
                    :value="tag.id"
                    :id="tag.id"
                    @change="toggleSelection(tag)"
                  />
                  {{ tag.title }}
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
    <ion-loading
      class="is-dark-grey"
      mode="md"
      :is-open="loadingFilters"
      message="Leistungen werden geladen..."
    />
  </ion-content>
</template>

<script setup lang="ts">
import { FilterKind, useFilterStore } from "@/stores/health/searchFilter";
import { CollapsibleListItem } from "@/types/collapsibleList";
import { IonContent, IonLoading } from "@ionic/vue";
import { computed, defineEmits, defineProps, onMounted, ref } from "vue";

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
    const index = expandedItemIds.value.findIndex(
      (expandedItemId) => expandedItemId === item.id
    );

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
  .invisible
    opacity: 0
    width: 0

  &.indent
    margin-left: 10%
    width: 90% !important

.select-none
    user-select: none
    pointer-events: none
</style>
