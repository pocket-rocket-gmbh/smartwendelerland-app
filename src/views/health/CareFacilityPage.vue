<template>
  <BackButtonLayout
    :force-back="generateForceBackUrl()"
    :show-login="false"
    :title="facility?.name"
    :show-bar="false"
    :is-facility-page="true"
  >
    <div class="facility-page" v-if="facility">
      <swiper
        :slides-per-view="1"
        :space-between="20"
        :modules="modules"
        :pagination="{ el: '.pagination' }"
        v-if="facility.image_url"
        class="header-image swiper"
        style="--swiper-pagination-color: #8ab61d; --swiper-pagination-top: 8px"
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

      <div class="general-font-size-title is-dark-grey ion-margin-top">
        {{ facility.name }}
        <img
          src="@/assets/images/check-decagram-outline.svg"
          class="insurance-logo"
          v-if="facility.billable_through_health_insurance_approved"
        />
      </div>

      <div class="tag-chips" v-if="facility.tags.length">
        <ion-chip v-for="tag in displayedTags(facility)" :key="tag.id">
          <span class="break-text">{{ tag.name }}</span>
        </ion-chip>
        <ion-chip
          v-if="facility.tags.length > 3 && !facility.showAllTags"
          @click.stop="showAllTags(facility)"
        >
          <span>+ {{ facility.tags.length - 1 }}</span>
        </ion-chip>
      </div>

      <div v-if="facility.kind !== 'news'" class="more-infos ion-padding">
        <div>
          <div class="has-text-health headline is-uppercase ion-margin-bottom">
            Kontakt und Infos
          </div>
          <ion-grid>
            <ion-row>
              <ion-col size="12" size-md="6">
                <div
                  v-if="facility.street"
                  class="info-grid"
                  @click="openMapsApp(facility.street)"
                >
                  <div>
                    <img src="@/assets/images/facilities/icon_address.svg" />
                  </div>
                  <div class="general-font-size is-dark-grey">
                    <div>{{ facility.street }}</div>
                    <div>{{ facility.zip }} {{ facility.town }}</div>
                  </div>
                </div>
                <div v-if="facility.phone" class="info-grid">
                  <div>
                    <img src="@/assets/images/facilities/icon_phone.svg" />
                  </div>
                  <div class="general-font-size is-dark-grey">
                    <a :href="`tel:${facility.phone}`">{{ facility.phone }}</a>
                  </div>
                </div>
                <div v-if="facility.email" class="info-grid">
                  <div>
                    <img src="@/assets/images/facilities/icon_mail.svg" />
                  </div>
                  <div class="general-font-size is-dark-grey" @click.stop>
                    <a :href="`mailto:${facility.email}`">{{ facility.email }}</a>
                  </div>
                </div>

                <div v-if="facility.name_instructor">
                  <div
                    class="has-text-health is-uppercase ion-margin-bottom ion-margin-top"
                  >
                    <span>Veranstalter</span>
                  </div>
                  <div class="is-dark-grey">{{ facility.name_instructor }}</div>
                </div>
              </ion-col>
              <ion-col>
                <div
                  v-if="facility.website"
                  class="button-rounded is-uppercase ion-margin-top"
                  @click="handleLinkClick(getWebsiteLink(facility.website))"
                >
                  Weitere Informationen
                </div>
                <div class="ion-margin-top">
                  <a
                    v-if="facility.email"
                    class="button-rounded is-uppercase"
                    :href="`mailto:${facility.email}`"
                  >
                    Kontakt aufnehmen
                  </a>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>

          <div
            v-if="
              facility.opening_hours.length > 0 &&
              openingHoursFilled(facility.opening_hours)
            "
            class="opening-hours"
          >
            <div
              class="has-text-health is-uppercase ion-margin-top headline ion-margin-bottom"
            >
              Öffnungszeiten
            </div>
            <div class="general-font-size is-dark-grey ion-no-padding">
              <ion-row
                v-for="opening in facility.opening_hours"
                :key="opening.day"
                class="divider"
              >
                <ion-col size="4" size-md="6">
                  <ion-label class="is-dark-grey general-font-size">{{
                    opening.day
                  }}</ion-label>
                </ion-col>
                <ion-col size="4" size-md="6" v-if="opening.hours.length">
                  <ion-label class="is-dark-grey general-font-size">{{
                    opening.hours
                  }}</ion-label>
                </ion-col>
              </ion-row>
            </div>
          </div>
        </div>
      </div>

      <div v-html="facility.description" class="general-font-size is-dark-grey" />
      <div
        v-if="facility.name_responsible_person"
        class="ion-margin-bottom general-font-size is-dark-grey"
      >
        <i>Inhaltlich verantwortlich: {{ facility.name_responsible_person }}</i>
      </div>
      <div v-if="facility.kind === 'news'" class="news-grid">
        <div>
          <span><img src="@/assets/images/watch.svg" /></span>
          {{ useDatetime().parseDatetime(facility.created_at) }}
        </div>
      </div>

      <div
        class="more-infos ion-margin-top ion-padding"
        v-if="facility.event_dates.length > 0"
      >
        <div class="has-text-health general-font-size is-uppercase ion-margin-bottom">
          Termine
        </div>
        <div class="ion-margin-bottom general-font-size is-dark-grey">
          {{ facility.event_dates.length }} Termin<span
            v-if="facility.event_dates.length > 1"
            >e</span
          >
          gefunden
        </div>

        <table class="table is-dark-grey general-font-size">
          <thead>
            <th>Datum</th>
            <th>Uhrzeit</th>
          </thead>
          <tbody>
            <tr v-for="(date, index) in mapDates(facility.event_dates)" :key="index">
              <td class="divider">
                {{ date.getDate() }}.{{ formattedDateString(date.getMonth() + 1) }}.{{
                  date.getFullYear()
                }}
              </td>
              <td class="divider">
                {{ date.getHours() }}:{{ formattedDateString(date.getMinutes()) }}
                Uhr
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="more-infos ion-margin-top ion-padding"
        v-for="document in facility.sanitized_documents"
        :key="document.signed_id"
        @click="handleLinkClick(document.url)"
      >
        <div class="has-text-health is-uppercase general-font-size ion-margin-bottom">
          Dokumente
        </div>

        <div class="general-font-size is-dark-grey documents">
          <img src="@/assets/images/download.svg" width="24"/>
          <span>{{ document.name }}.pdf</span>
        </div>
      </div>
    </div>

    <ion-loading :is-open="loading" message="Wird geladen..." />
  </BackButtonLayout>
</template>
<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { computed, ref } from "vue";
import BackButtonLayout from "@/components/general/BackButtonLayout.vue";
import { usePublicApi } from "@/composables/api/public";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { onIonViewDidEnter, IonIcon } from "@ionic/vue";
import { useRoute } from "vue-router";
import { Browser } from "@capacitor/browser";
import { useImageCache } from "@/composables/ui/imageCache";
import { useDatetime } from "@/composables/ui/datetime";
import { isPlatform } from "@ionic/vue";
import { checkDecagramOutline } from "@/assets/images/check-decagram-outline.svg";

const route = useRoute();
const loading = ref(false);
const imageCache = useImageCache();

const facilityId = computed(() => {
  return route.params.id as string;
});

const showApi = useCollectionApi();
const facility = showApi.item;

const showMoreButton = ref(true);

const showAllTags = (facility: { showAllTags: boolean }) => {
  facility.showAllTags = true;
  showMoreButton.value = false;
};

const openMapsApp = (location: any) => {
  if (isPlatform("android")) {
    window.location.href = `https://maps.google.com/?q=${location}`;
  } else {
    window.location.href = `maps://maps.apple.com/?q=${location}`;
  }
};

const displayedTags = computed(
  () => (facility: { showAllTags: any; tags: string | any[] }) => {
    return facility.showAllTags ? facility.tags : facility.tags.slice(0, 3);
  }
);

const getItem = async () => {
  showApi.setBaseApi(usePublicApi("health"));
  showApi.setEndpoint(`care_facilities`);
  loading.value = true;
  await showApi.getItem(facilityId.value);
  loading.value = false;
};

const handleLinkClick = async (url: string) => {
  await Browser.open({ url: url });
};

onIonViewDidEnter(() => {
  getItem();
});

const generateForceBackUrl = () => {
  let baseUrl = `/health/search?kind=${facility.value?.kind}`;
  let tags = route.query?.tags;
  let community = route.query?.community;
  if (tags) {
    baseUrl += `&tags=${tags}`;
  }
  if (community) {
    baseUrl += `&community=${community}`;
  }
  return baseUrl;
};

const getWebsiteLink = (url: string) => {
  if (url.startsWith("http") || url.startsWith("https")) {
    return url;
  } else {
    return `https://${url}`;
  }
};

const parseDate = (dateString: string) => {
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
};

const mapDates = (dateStrings: string[]) => {
  let dates = dateStrings.map(parseDate);

  return dates.sort((a: any, b: any) => a - b);
};

const formattedDateString = (rawNumber: number) => {
  return rawNumber < 10 ? `0${rawNumber}` : rawNumber;
};

const openingHoursFilled = (openingHours: any[]) => {
  for (const item of openingHours) {
    if (item.hours.trim() !== "") {
      return true;
    }
  }
  return false;
};

const modules = [Pagination];
</script>
<style lang="sass">
.header-image img
  border-radius: 10px
.tags
  font-size: 1.2rem
  span
    margin-right: 10px
.more-infos
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.15)
  border-radius: 10px
  margin-top: 30px
.info-grid
  margin-bottom: 10px
  display: grid
  gap: 2%
  grid-template-columns: 25px auto
  a
    color: #636362
    text-decoration: none
.opening-hours
  .day
    font-weight: bold
    margin-right: 5px
.news-grid
  display: grid
  grid-template-columns: 50% 50%

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
  right: 3%
  width: 30%

.button-rounded
  color: var(--ion-color-health)
  text-decoration: none
  border: 1px solid var(--ion-color-health)
  padding: 8px 30px
  border-radius: 20px
  display: inline-block
  width: 100%
  text-align: center
  // make button 300px width on higher resolutions
  @media (min-width: 768px)
    width: 300px

.table
  td
    padding: 5px 30px

.insurance-logo
  height: 25px
  margin-bottom: -3px

.contect-icons
  display: flex
  align-content: center
  width: 30px
  margin-right: 10px

.tag-chips
  display: flex
  align-content: center
  flex-wrap: wrap

ion-chip
  --background: var(--ion-color-health)
  --color: white
  font-size: 1.2rem

.facility-page
  padding: 10px

.documents
  display: flex
  align-items: center
  gap: 10px
</style>
