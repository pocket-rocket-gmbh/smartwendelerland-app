<template>
  <BackButtonLayout :force-back="`/health/search?kind=${facility?.kind}`">
    
    <div class="ion-padding" v-if="facility">
      <swiper
        :slides-per-view="1"
        :space-between="20"
        :modules="modules"
        :pagination="{ el: '.pagination' }"
        v-if="facility.image_url"
        class="header-image swiper"
      >
        <swiper-slide>
          <img :src="imageCache.cacheableImageUrl(facility.image_url)" class="showroom"/>
          <img v-if="facility.logo_url" :src="facility.logo_url" class="logo" />
        </swiper-slide>
        <swiper-slide v-for="(image, index) in facility.sanitized_images" :key="index">
          <img :src="imageCache.cacheableImageUrl(image.url)" class="showroom"/>
        </swiper-slide>
        <div class="pagination" />
      </swiper>
      <div class="headline ion-margin-top">{{ facility.name }}</div>
      <div class="has-text-health font-size-small tags ion-margin-bottom" v-if="facility.tags.length > 0">
        <span v-for="tag in facility.tags" :key="tag.id">{{ tag.name }}</span>
      </div>

      <div v-html="facility.description" />

      <div v-if="facility.kind === 'news'" class="news-grid">
        <div><span><img src="@/assets/images/watch.svg"></span> {{ useDatetime().parseDatetime(facility.created_at) }}</div>

        <div v-if="facility.user"><span><img src="@/assets/images/user.svg"></span> {{ facility.user.name }}</div>
      </div>
      <div v-else class="more-infos ion-padding">
        <div>
          <div v-if="facility.phone" class="info-grid">
            <div><img src="@/assets/images/phone.svg"></div>
            <div><a :href="`tel:${facility.phone}`">{{ facility.phone }}</a></div>
          </div>
          <div v-if="facility.email" class="info-grid">
            <div><img src="@/assets/images/mail.svg"></div>
            <div><a :href="`mailto:${facility.email}`">{{ facility.email }}</a></div>
          </div>
          <div v-if="facility.street" class="info-grid">
            <div><img src="@/assets/images/location.svg"></div>
            <div>
              <div>{{ facility.street }}</div>
              <div>{{ facility.zip }} {{ facility.town }}</div>
            </div>
          </div>
          <div class="info-grid" v-if="facility.opening_hours">
            <div><img src="@/assets/images/watch.svg"></div>
            <div v-html="facility.opening_hours.replaceAll('\n', '<br/>')" />
          </div>
        </div>
      </div>

      <div class="more-infos ion-margin-top ion-padding" v-for="document in facility.sanitized_documents" :key="document.signed_id" @click="handleDocumentClick(document.url)">
        <div class="headline ion-margin-bottom">{{ document.name }}</div>

        <div>
          <img src="@/assets/images/download.svg">
          <span class="has-text-health">Download PDF</span>
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
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper'
import 'swiper/css'
import "swiper/css/pagination"
import { computed, ref } from 'vue';
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import { usePublicApi } from '@/composables/api/public';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { onIonViewDidEnter } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { Browser } from '@capacitor/browser'
import { useImageCache } from '@/composables/ui/imageCache'
import { useDatetime } from '@/composables/ui/datetime';

const route = useRoute()
const loading = ref(false)
const imageCache = useImageCache()

const facilityId = computed(() => {
  return route.params.id as string
})

const showApi = useCollectionApi()
const facility = showApi.item

const getItem = async () => {
  showApi.setBaseApi(usePublicApi('health'))
  showApi.setEndpoint(`care_facilities`)
  loading.value = true
  await showApi.getItem(facilityId.value)
  loading.value = false
}

const handleDocumentClick = async (url:string) => {
  await Browser.open({ url: url })
}

onIonViewDidEnter(() => {
  getItem()
})
</script>
<style lang="sass">
.header-image img
  border-radius: 10px
.tags
  span
    margin-right: 10px
.more-infos
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.15)
  border-radius: 10px
  img
    margin-right: 5px
    margin-bottom: -2px
.info-grid
  margin-top: 10px
  display: grid
  grid-template-columns: 25px auto
.news-grid
  display: grid
  grid-template-columns: 50% 50%
  img
    margin-right: 5px
    margin-bottom: -2px

.pagination
  text-align: center
  z-index: 1
  position: absolute
  bottom: 0px
.showroom
  display: block
  width: 100%
  height: 100%
  object-fit: cover
.logo
  position: absolute
  top: 3%
  left: 3%
  width: 30%
</style>