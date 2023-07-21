<template>
  <BackButtonLayout force-back="/health/categories">
    <div v-if="category">
      <div class="health-top-panel is-headline">
        <div class="headline">{{ category?.name }}</div>
      </div>
      <div class="health-category-tags">
        <span v-for="subCategory in subCategories" :key="subCategory.id" @click="setItemsAndGo(subCategory)" :class="['health-category-tag', {'is-active' : currentSubCategory?.id === subCategory.id }]">
          {{ subCategory.name }}
        </span>
      </div>

      <div v-for="subSubCategory in subSubCategories" :key="subSubCategory.id" class="health-sub-category-box" @click="handleClick(subSubCategory)">
        <div class="image-left" :style="`background: url(${subSubCategory.image_url}); background-size: contain;`">
        </div>
        <div class="content-right">
          <div class="has-text-health">{{ subSubCategory.name }}</div>
          <div class="description" v-html="subSubCategory.description"></div>
          <div class="cta">Mehr erfahren ></div>
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
import { onIonViewDidEnter, IonLoading } from '@ionic/vue';
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

</style>