<template>
  <BackButtonLayout force-back="/health/categories">
    <div v-if="category">
      <div class="health-top-panel">
        {{ category?.name }}
      </div>
      <div class="health-category-tags">
        <span v-for="(sub_category, index) in subCategories" :key="index" @click="setItemsAndGo(category, sub_category)" class="health-category-tag">
          {{ sub_category.name }}
        </span>
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
const route = useRoute()
const categoryId = computed(() => {
  return `${route.params.id}`
})
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
}


const setItemsAndGo = (category:any, subCategory:any) => {
  console.log("huhu")
}

onIonViewDidEnter(() => {
  getCategory()
  getSubCategories()
})

</script>

<style lang="sass" scoped>

</style>