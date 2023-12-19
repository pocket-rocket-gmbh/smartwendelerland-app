<template>
  <BackButtonLayout
    force-back="/health/categories/"
    :show-login="false"
    :title="category?.name"
    :show-bar="true"
    :is-category-page="true"
  >
    <div v-if="category" :class="(getPlatforms().some(platform => platform === 'cordova' || platform === 'ios')) ? 'categories-ios' : 'categories'">
      <div class="health-category-tags">
        <span
          v-for="subCategory in subCategories"
          :key="subCategory.id"
          @click="setItemsAndGo(subCategory)"
          :class="[
            'health-category-tag',
            { 'is-active': currentSubCategory?.id === subCategory.id },
          ]"
        >
          {{ subCategory.name }}
        </span>
      </div>
      <div class="ion-padding-start ion-padding-end is-dark-grey hypernate" lang="de">
        <div
          class="general-font-size is-dark-grey"
          v-html="currentSubCategory?.description"
        />
      </div>
      <div
        v-for="subSubCategory in subSubCategories"
        :key="subSubCategory.id"
        class="health-sub-category-box"
      >
        <div
          @click="handleClick(subSubCategory)"
          class="image-left"
          :style="`background: url(${subSubCategory.image_url}); background-size: cover; background-repeat: no-repeat; background-position: center;`"
        ></div>
        <div class="content-right">
          <div
            class="headline has-text-health"
            @click="
              detailModalOpen = true;
              selectedSubSubCategory = subSubCategory;
            "
          >
            {{ subSubCategory.name }}
            <span
              class="content general-font-size is-dark-grey hypernate"
              lang="de"
              @click="
                detailModalOpen = true;
                selectedSubSubCategory = subSubCategory;
              "
            >
              {{ subSubCategory.description }}
            </span>
          </div>

          <div class="show-more">
            <ion-button
              mode="md"
              shape="round"
              expand="block"
              class="green-button"
              @click="handleClick(subSubCategory)"
            >
              <span
                v-if="
                  subSubCategory?.url &&
                  subSubCategory.url_kind === 'external' &&
                  !subSubCategory?.button_text
                "
                >Zur Webseite</span
              >
              <span v-else-if="subSubCategory?.button_text"
                >{{ subSubCategory?.button_text }}
              </span>
              <span v-else>Mehr erfahren</span>
            </ion-button>
          </div>
        </div>
      </div>
    </div>
    <ion-loading class="is-dark-grey" mode="md" :is-open="loading" message="Wird geladen..." />
  </BackButtonLayout>
</template>

<script setup lang="ts">
import { useFilterStore } from "@/stores/health/searchFilter";
import { useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import BackButtonLayout from "@/components/general/BackButtonLayout.vue";
import { useRoute } from "vue-router";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";
import {
  IonToolbar,
  onIonViewDidEnter,
  IonLoading,
  IonModal,
  IonHeader,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  getPlatforms,
} from "@ionic/vue";
import { Browser } from "@capacitor/browser";
const router = useRouter();
const filterStore = useFilterStore();
const route = useRoute();
const categoryId = computed(() => {
  return `${route.params.id}`;
});
const currentSubCategory = ref(null) as any;
const subCategories = ref([]) as any;
const loading = ref(false);
const category = ref(null) as any;
const categoryApi = useCollectionApi();
const detailModalOpen = ref(false);
const selectedSubSubCategory = ref(null) as any;
categoryApi.setBaseApi(usePublicApi("health"));

const getCategory = async () => {
  loading.value = true;
  categoryApi.setEndpoint(`categories`);
  await categoryApi.getItem(categoryId.value);
  category.value = categoryApi.item.value;
  loading.value = false;
};

const categoriesApi = useCollectionApi();
categoriesApi.setBaseApi(usePublicApi("health"));
const getSubCategories = async () => {
  categoriesApi.setEndpoint(`categories/${categoryId.value}/sub_categories`);
  const options = {
    page: 1,
    per_page: 1000,
    sort_by: "menu_order",
    sort_order: "ASC",
    searchQuery: null,
    concat: false,
    filters: [],
  };
  const res = await categoriesApi.retrieveCollection(options);
  subCategories.value = res.data.resources;
  if (res.data.resources.length > 0) {
    setItemsAndGo(res.data.resources[0]);
  }
};

const subSubCategories = ref(null);
const listApi = useCollectionApi();
listApi.setBaseApi(usePublicApi("health"));

const getSubSubCategories = async () => {
  listApi.setEndpoint(
    `categories/${categoryId.value}/sub_categories/${currentSubCategory.value.id}/sub_sub_categories`
  );
  const options = {
    page: 1,
    per_page: 1000,
    sort_by: "menu_order",
    sort_order: "ASC",
    searchQuery: null,
    concat: false,
    filters: [],
  };
  loading.value = true;
  await listApi.retrieveCollection(options);
  loading.value = false;
  subSubCategories.value = listApi.items.value as any;
};

const setItemsAndGo = (subCategory: any) => {
  currentSubCategory.value = subCategory;
  getSubSubCategories();
};

const handleClick = async (subSubCategory: any) => {
  if (subSubCategory.url_kind === "external") {
    await Browser.open({ url: subSubCategory.url });
  } else {
    if (subSubCategory.url.includes("https://gesundes-wnd.de/public/search")) {
      let searchUrl = subSubCategory.url.split("/");
      let scope = searchUrl[searchUrl.length - 1];
      if (scope === "courses") {
        scope = "course";
      } else if (scope === "events") {
        scope = "event";
      } else if (scope === "facilities") {
        scope = "facility";
      } else if (scope === "news") {
        scope = "news";
      }

      const parsedUrl = new URL(subSubCategory.url);
      const searchParams = new URLSearchParams(parsedUrl.search);

      const paramsObject = {};
      searchParams.forEach((value, key) => {
        paramsObject[key] = value;
      });

      const filter = paramsObject.filter ? JSON.parse(paramsObject.filter) : null;
      if (filter && filter?.currentSearchTerm) {
        filterStore.currentSearchTerm = filter?.currentSearchTerm;
      }
      if (filter && filter?.currentTags) {
        filterStore.currentTags = filter?.currentTags;
      }
      if (filter && filter?.currentZip) {
        filterStore.currentZip = filter?.currentZip;
      }

      router.push({
        path: `/health/search`,
        query: {
          kind: filter ? filter.currentKinds[0] : scope,
          page: "category",
          id: categoryId.value,
        },
      });
    }
  }

  selectedSubSubCategory.value = null;
};

onIonViewDidEnter(() => {
  getCategory();
  getSubCategories();
});
</script>

<style lang="sass" scoped>
ion-toolbar
  padding-top: 40px !important
.modal-image
  width: 250px
  margin-right: 20px
  margin-bottom: 10px

.image-left
  max-width: 250px
  max-height: 250px
  @media (max-width: 768px)
    display: none

.categories
  margin: 120px 0 0 0

.categories-ios
  margin: 170px 0 0 0

.show-more
  margin-top: 10px 

.modal-content
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 1rem
</style>
