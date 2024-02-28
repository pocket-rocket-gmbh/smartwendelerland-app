<template>
  <BackButtonLayout
    force-back="/health/categories/"
    :show-login="false"
    :title="category?.name"
    :show-bar="true"
    :is-category-page="true"
  >
    <div v-if="category" class="categories">
      <div class="health-category-tags">
        <span
          v-for="subCategory in category.sub_categories"
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
    <ion-loading
      class="is-dark-grey"
      mode="md"
      :is-open="loading"
      message="Wird geladen..."
    />
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
import { onIonViewDidEnter, IonLoading, IonButton, isPlatform } from "@ionic/vue";
import { Browser } from "@capacitor/browser";
import { dataURLtoFile, fileToBase64 } from '@/utils/file'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { FileOpener } from '@awesome-cordova-plugins/file-opener'

const router = useRouter();
const filterStore = useFilterStore();
const route = useRoute();
const categoryId = computed(() => {
  return `${route.params.id}`;
});
const currentSubCategory = ref(null) as any;
const loading = ref(false);
const category = ref(null) as any;
const categoryApi = useCollectionApi();
const detailModalOpen = ref(false);
const selectedSubSubCategory = ref(null) as any;
categoryApi.setBaseApi(usePublicApi("health"));

const getCategory = async () => {
  categoryApi.setEndpoint(`categories`);
  await categoryApi.getItem(categoryId.value);
  category.value = categoryApi.item.value;
  currentSubCategory.value = category.value.sub_categories[0];
};

const categoriesApi = useCollectionApi();
categoriesApi.setBaseApi(usePublicApi("health"));
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
    concat: false,
  };
  await listApi.retrieveCollection(options);
  subSubCategories.value = listApi.items.value as any;
};

const setItemsAndGo = (subCategory: any) => {
  currentSubCategory.value = subCategory;
  getSubSubCategories();
};

const handleClick = async (subSubCategory: any) => {
  let link = subSubCategory.url;
  if (subSubCategory?.url.includes(".pdf")) {
    openPdf(link)
  }
  if (subSubCategory.url_kind === "external" && !subSubCategory?.url.includes(".pdf")) {
    if (isPlatform("android")) {
      Browser.open({ url: link });
    } else {
      await Browser.open({ url: link });
    }
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
        filterStore.currentFacilityTags = filter?.currentFacilityTags;
      }
      if (filter && filter?.currentServiceTags) {
        filterStore.currentServiceTags = filter?.currentServiceTags;
      }
      if (filter && filter?.currentZips) {
        filterStore.currentZips = filter?.currentZips;
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

const openPdf = async (link: any) => {
  const agbPdfPath = link;
  const rawPdf = await fileToBase64(agbPdfPath);
  openPDF(rawPdf);
};

const openPDF = (rawPdf: string) => {
  if (isPlatform("cordova")) {
    const pdfContentBase64 = rawPdf;

    Filesystem.writeFile({
      path: rawPdf,
      data: pdfContentBase64,
      directory: Directory.Data,
    }).then((result) => {
      FileOpener.open(result.uri, "application/pdf");
    });
  } else {
    const file = dataURLtoFile(rawPdf, "AGB");
    const url = URL.createObjectURL(file);
    window.open(url);
  }
};

onIonViewDidEnter(async () => {
  loading.value = true;
  await getCategory();
  await getSubSubCategories();
  loading.value = false;
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
  margin: 20px 0 0 0

.show-more
  margin-top: 10px

.modal-content
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 1rem
</style>
