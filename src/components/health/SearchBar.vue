<template>
  <ion-page>
    <ion-searchbar
      mode="md"
      class="has-background-white placeholder ion-no-padding main-search-bar"
      :placeholder="placeholder"
      v-model="filterStore.currentSearchTerm"
      @ionClear="clearSearch"
      enterkeyhint="search"
      inputmode="text"
      @keyup.enter="emitHandleSearch"
      :animated="true"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, onMounted } from "vue";
import { IonSearchbar } from "@ionic/vue";
import { useFilterStore } from "@/stores/health/searchFilter";

const emit = defineEmits(["handleSearch"]);

const props = defineProps({
  placeHolderText: {
    type: String,
    required: false,
  },
  loading: {
    type: Boolean,
    required: false,
  },
  header: {
    type: Boolean,
    required: false,
  },
  setFocus: {
    type: Boolean,
    required: false,
  },
  categoryPage: {
    type: Boolean,
    required: false,
  },
});

const handleSetFocus = () => {
  let elem = document.querySelector(".placeholder input") as HTMLInputElement;
  if (elem) {
    elem.focus();
  }
};

const placeholder = computed(() => {
  if (props.placeHolderText && !props.loading) {
    return props.placeHolderText;
  } else {
    return "Finde Themen, Anbieter, Kurse…";
  }
});

onMounted(() => {
  if (props.setFocus) {
    setTimeout(() => {
      handleSetFocus();
    }, 100);
  }
});

const filterStore = useFilterStore();

const emitHandleSearch = () => {
  emit("handleSearch");
};

const clearSearch = () => {
  filterStore.filteredResults = [];
  filterStore.currentSearchTerm = "";
  filterStore.filteredResults = filterStore.allResults;
};
</script>

<style lang="sass" scoped>
ion-searchbar
  --background: white
  --background-color: white
  --border-radius: 7px
  --box-shadow: none

.main-search-bar
  margin-top: 0px

</style>
