<template>
  <div class="divider"></div>
  <ion-content class="ion-padding-top">
    <div class="filter-options content-wrap">
      <div
        v-for="filter in filterStore.filteredFacilityMainFilters"
        :key="filter.id"
      >
        <div
          v-if="hasActiveOptions(filter.id)"
          class="general-font-size-subtitle font-weight-bold is-dark-grey the-filters"
        >
          <div class="category-title">{{ filter.name }}</div>
          <div>
            <ion-button
              mode="md"
              class=""
              :class="
                areAllSelected(filter) ? 'green-button' : 'green-button-plus'
              "
              @click="handleToggleAll(filter)"
            >
              <span>
                {{
                  areAllSelected(filter) ? "Alle abwählen" : "Alle auswählen"
                }}</span
              ></ion-button
            >
          </div>
        </div>
        <div class="the-filter">
          <label
            class="option"
            v-for="option in filter.options"
            :key="option.id"
          >
            <div
              :model-value="modelValue.includes(option.id)"
              @click.prevent="handleOptionSelect(option)"
              hide-details
              class="options-select communities general-font-size"
              :class="{
                'is-selected': modelValue.includes(option.id),
              }"
            >
              {{ option.name }}
            </div>
          </label>
        </div>
      </div>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { useFilterStore, FilterKind } from "@/stores/health/searchFilter";
import { ref, watch, defineProps, defineEmits } from "vue";

type Filter = {
  id: string;
  name: string;
  care_facilities_active_count: number;
};

const props = defineProps<{
  modelValue: string[];
  filterKind: FilterKind;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", values: string[]): void;
}>();

const hasActiveOptions = (filterId: string) => {
  const options = filterStore.allFacilityMainFilters.find(
    ({ id }) => id === filterId
  )?.options;
  return (
    options &&
    options.some((option) => Number(option?.care_facilities_active_count) > 0)
  );
};

const multipleSelections = ref<Filter[]>([]);

const filterStore = useFilterStore();

const handleOptionSelect = (option: Filter) => {
  const indexOfAlreadySetFilter = props.modelValue.findIndex(
    (item) => item === option.id
  );

  if (indexOfAlreadySetFilter !== -1) {
    // eslint-disable-next-line vue/no-mutating-props
    props.modelValue.splice(indexOfAlreadySetFilter, 1);
    multipleSelections.value = multipleSelections.value?.filter(
      (item) => item.id !== option.id
    );
  } else {
    // eslint-disable-next-line vue/no-mutating-props
    props.modelValue.push(option.id);
    multipleSelections.value.push(option);
  }

  emit("update:modelValue", props.modelValue);
};

const handleToggleAll = (filter: any) => {
  const options = filterStore.allFacilityMainFilters.find(
    ({ id }) => id === filter.id
  )?.options;
  const relevantOptions = options.filter(
    (option) => !!option?.care_facilities_active_count
  );

  const selectAll = !areAllSelected(filter);

  if (selectAll) {
    relevantOptions.forEach((option) => {
      if (!props.modelValue.includes(option.id)) {
        multipleSelections.value.push(option);
      }
    });
  } else {
    relevantOptions.forEach((option) => {
      const indexOfAlreadySetFilter = props.modelValue.findIndex(
        (item) => item === option.id
      );
      if (indexOfAlreadySetFilter !== -1) {
        // eslint-disable-next-line vue/no-mutating-props
        props.modelValue.splice(indexOfAlreadySetFilter, 1);
      }
    });

    multipleSelections.value = multipleSelections.value.filter(
      (item) => !relevantOptions.find((option) => option.id === item.id)
    );
  }

  emit(
    "update:modelValue",
    multipleSelections.value.map((item) => item.id)
  );
};

const areAllSelected = (filter: any) => {
  const options = filterStore.allFacilityMainFilters.find(
    ({ id }) => id === filter.id
  )?.options;
  const relevantOptions = options.filter(
    (option) => !!option?.care_facilities_active_count
  );

  return relevantOptions.every((option) =>
    multipleSelections.value.find((item) => item.id === option.id)
  );
};

watch(
  () => props.modelValue,
  () => {
    multipleSelections.value = filterStore.allFacilityMainFilters.reduce(
      (prev, curr) => {
        const foundOptions = curr.options.filter((option) =>
          props.modelValue.includes(option.id)
        );
        return [...prev, ...foundOptions];
      },
      [] as Filter[]
    );
  }
);
</script>
<style lang="sass" scoped>
.content-wrap
  padding-bottom: 150px

.the-filters
  display: flex
  flex-wrap: wrap
  align-items: center
  align-content: center
  gap: 30px
  margin: 10px 0

.category-title
  margin-left: 10px

.the-filter
  display: flex
  flex-wrap: wrap

.filter-options
  margin-bottom: 30px
</style>
