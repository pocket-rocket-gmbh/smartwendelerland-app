<template>
  <BackButtonLayout force-back="/health/categories" :show-login="false">
    <ion-modal :is-open="true" v-if="detailModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ selectedSubSubCategory?.name }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="detailModalOpen = false; selectedSubSubCategory = null;">Schließen</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <img :src="selectedSubSubCategory?.image_url" class="modal-image" />
        <div>
          {{ selectedSubSubCategory?.description }}
        </div>

        <ion-button expand="block" class="ion-margin-top" @click="handleClick(selectedSubSubCategory)">Mehr erfahren ></ion-button>
      </ion-content>
    </ion-modal>

    <div v-if="category">
      <div class="health-top-panel is-headline">
        <div class="headline">{{ category?.name }}</div>
      </div>
      <div class="health-category-tags">
        <span v-for="subCategory in subCategories" :key="subCategory.id" @click="setItemsAndGo(subCategory)" :class="['health-category-tag', {'is-active' : currentSubCategory?.id === subCategory.id }]">
          {{ subCategory.name }}
        </span>
      </div>

      <div class="ion-padding-start ion-padding-end is-justified">
        <div v-html="currentSubCategory?.description" />
      </div>

      <div v-for="subSubCategory in subSubCategories" :key="subSubCategory.id" class="health-sub-category-box">
        <div @click="handleClick(subSubCategory)" class="image-left" :style="`background: url(${subSubCategory.image_url}); background-size: contain; background-repeat: no-repeat;`">
        </div>
        <div class="content-right">
          <div class="headline has-text-health" @click="detailModalOpen = true; selectedSubSubCategory = subSubCategory">{{ subSubCategory.name }}</div>
          <div class="content" v-html="subSubCategory.description" @click="detailModalOpen = true; selectedSubSubCategory = subSubCategory"></div>
          <div class="cta" @click="handleClick(subSubCategory)">Mehr erfahren ></div>
        </div>
      </div>
    </div>
    <ion-loading
      :is-open="loading"
      message="Wird geladen..."
    />
  </BackButtonLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import { useRoute } from 'vue-router';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';
import { onIonViewDidEnter, IonLoading, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/vue';
import { Browser } from '@capacitor/browser'
const route = useRoute()
const categoryId = computed(() => {
  return `${route.params.id}`
})
const currentSubCategory = ref(null) as any
const subCategories = ref([]) as any
const loading = ref(false)
const category = ref(null) as any
const categoryApi = useCollectionApi()
const detailModalOpen = ref(false)
const selectedSubSubCategory = ref(null) as any
categoryApi.setBaseApi(usePublicApi('health'))

const getCategory = async () => {
  loading.value = true
  categoryApi.setEndpoint(`categories`)
  await categoryApi.getItem(categoryId.value)
  category.value = categoryApi.item.value
  loading.value = false
}

const categoriesApi = useCollectionApi()
categoriesApi.setBaseApi(usePublicApi('health'))
const getSubCategories = async () => {
  categoriesApi.setEndpoint(`categories/${categoryId.value}/sub_categories`)
  const options = { page: 1, per_page: 1000, sort_by: 'menu_order', sort_order: 'ASC', searchQuery: null, concat: false, filters: [] }
  const res = await categoriesApi.retrieveCollection(options)
  subCategories.value = res.data.resources
  if (res.data.resources.length > 0) {
    setItemsAndGo(res.data.resources[0])
  }
}

const subSubCategories = ref(null)
const listApi = useCollectionApi()
listApi.setBaseApi(usePublicApi('health'))

const getSubSubCategories = async () => {
  listApi.setEndpoint(`categories/${categoryId.value}/sub_categories/${currentSubCategory.value.id}/sub_sub_categories`)
  const options = { page: 1, per_page: 1000, sort_by: 'menu_order', sort_order: 'ASC', searchQuery: null, concat: false, filters: [] }
  loading.value = true
  await listApi.retrieveCollection(options)
  loading.value = false
  subSubCategories.value = listApi.items.value as any
}


const setItemsAndGo = (subCategory:any) => {
  currentSubCategory.value = subCategory
  getSubSubCategories()
}

const handleClick = async (subSubCategory:any) => {
  if (subSubCategory.url_kind === 'external') {
    await Browser.open({ url: subSubCategory.url })
  }
}

onIonViewDidEnter(() => {
  getCategory()
  getSubCategories()
})

</script>

<style lang="sass" scoped>
.modal-image
  width: 100px
  float: left
  margin-right: 10px
  margin-bottom: 10px
</style>