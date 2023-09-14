<template>
  <BackButtonLayout :force-back="`/health/search?kind=${facility?.kind}`">

    <div class="ion-padding" v-if="facility">
      <swiper :slides-per-view="1" :space-between="20" :modules="modules" :pagination="{ el: '.pagination' }"
        v-if="facility.image_url" class="header-image swiper"
        style="--swiper-pagination-color: #8AB61D; --swiper-pagination-top: 8px;"
      >
        <swiper-slide>
          <img :src="imageCache.cacheableImageUrl(facility.image_url)" class="showroom" />
          <img v-if="facility.logo_url" :src="facility.logo_url" class="logo" />
        </swiper-slide>
        <swiper-slide v-for="(image, index) in facility.sanitized_images" :key="index">
          <img :src="imageCache.cacheableImageUrl(image.url)" class="showroom" />
        </swiper-slide>
        <div class="pagination" />
      </swiper>

      <div class="headline ion-margin-top">
        {{ facility.name }} <img src="@/assets/images/check-decagram-outline.svg" class="insurance-logo" v-if="facility.billable_through_health_insurance_approved" />
      </div>
      <div class="has-text-health font-size-small tags ion-margin-bottom" v-if="facility.tags.length > 0">
        <span v-for="tag in facility.tags" :key="tag.id">{{ tag.name }}</span>
      </div>

      <div v-html="facility.description" />
      <div v-if="facility.name_responsible_person" class="ion-margin-bottom"><i>Inhaltlich verantwortlich: {{ facility.name_responsible_person }}</i></div>
      <div v-if="facility.kind === 'news'" class="news-grid">
        <div><span><img src="@/assets/images/watch.svg"></span> {{ useDatetime().parseDatetime(facility.created_at) }}
        </div>

        <div v-if="facility.user"><span><img src="@/assets/images/user.svg"></span> {{ facility.user.name }}</div>
      </div>
      <div v-else class="more-infos ion-padding">
        <div>
          <div class="has-text-health font-size-medium is-uppercase ion-margin-bottom">Kontakt und Infos</div>
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
          <div v-if="facility.name_instructor">
            <div class="has-text-health is-uppercase ion-margin-bottom ion-margin-top">Veranstalter</div>
            <div>{{ facility.name_instructor }}</div>
          </div>
          <div v-if="facility.website" class="button-rounded is-uppercase ion-margin-top" @click="handleLinkClick(getWebsiteLink(facility.website))">
            Weitere Informationen
            <ion-icon :icon="openOutline" />
          </div>
          <div class="ion-margin-top">
            <a v-if="facility.email" class="button-rounded is-uppercase" :href="`mailto:${facility.email}`">
              Kontakt aufnahmen
            </a>
          </div>
          <div v-if="facility.opening_hours.length > 0" class="opening-hours">
            <div class="has-text-health font-size-medium is-uppercase ion-margin-top ion-margin-bottom">Öffnungszeiten
            </div>
            <div v-for="(hour, index) in facility.opening_hours" :key="index">
              <span class="day">{{ hour.day }}</span><span v-if="hour.hours">{{ hour.hours }}</span><span v-else>Keine
                Angabe</span>
            </div>
          </div>
        </div>
      </div>

      <div class="more-infos ion-margin-top ion-padding" v-if="facility.event_dates.length > 0">
        <div class="has-text-health font-size-medium is-uppercase ion-margin-bottom">Termine</div>
        <div class="ion-margin-bottom">
          {{ facility.event_dates.length }} Termin<span v-if="facility.event_dates.length > 1">e</span> gefunden
        </div>
        <table class="table">
          <thead>
            <th>Datum</th>
            <th>Uhrzeit</th>
          </thead>
          <tbody>
            <tr v-for="(date, index) in mapDates(facility.event_dates)" :key="index">
              <td>{{ date.getDate() }}.{{ formattedDateString(date.getMonth() + 1) }}.{{ date.getFullYear() }}</td>
              <td>{{ date.getHours() }}:{{ formattedDateString(date.getMinutes()) }} Uhr</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="more-infos ion-margin-top ion-padding" v-for="document in facility.sanitized_documents"
        :key="document.signed_id" @click="handleLinkClick(document.url)">
        <div class="has-text-health font-size-medium is-uppercase ion-margin-bottom">Dokumente</div>

        <div>
          <img src="@/assets/images/download.svg">
          <span>{{ document.name }}.pdf</span>
        </div>
      </div>
    </div>


    <ion-loading :is-open="loading" message="Wird geladen..." />
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
import { onIonViewDidEnter, IonIcon } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { Browser } from '@capacitor/browser'
import { useImageCache } from '@/composables/ui/imageCache'
import { useDatetime } from '@/composables/ui/datetime';
import { openOutline } from 'ionicons/icons'
import { checkDecagramOutline } from '@/assets/images/check-decagram-outline.svg'

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

const handleLinkClick = async (url: string) => {
  await Browser.open({ url: url })
}

onIonViewDidEnter(() => {
  getItem()
})

const getWebsiteLink = (url: string) => {
  if (url.startsWith('http') || url.startsWith('https')) {
    return url
  } else {
    return `https://${url}`
  }
}

const parseDate = (dateString:string) => {
  const parts = dateString.split(/[\s.:-]/);
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1] - 1, 10);
  const year = parseInt(parts[2], 10);
  const hour = parseInt(parts[3], 10);
  const minute = parseInt(parts[4], 10);

  const date = new Date(year, month, day, hour, minute);
  
  // Convert to Berlin timezone
  date.toLocaleString("de-DE");
  
  return date;
}

const mapDates = (dateStrings:string[]) => {
  let dates = dateStrings.map(parseDate)

  return dates.sort((a:any, b:any) => a - b)
}

const formattedDateString = (rawNumber:number) => {
  return rawNumber < 10 ? `0${rawNumber}` : rawNumber
}

const modules = [Pagination]

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
  margin-bottom: 10px
  display: grid
  grid-template-columns: 25px auto
.opening-hours
  .day
    font-weight: bold
    margin-right: 5px
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

.button-rounded
  color: var(--ion-color-health)
  text-decoration: none
  border: 1px solid var(--ion-color-health)
  padding: 8px 30px
  border-radius: 20px
  display: inline-block
  width: 300px
  text-align: center

.table
  td
    padding: 5px 10px
.insurance-logo
  height: 25px
  margin-bottom: -3px
</style>