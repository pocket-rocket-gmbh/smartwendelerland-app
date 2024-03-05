<template>
  <BackButtonLayout
    :force-back="generateForceBackUrl()"
    :show-login="false"
    :title="facility?.name"
    :show-bar="false"
    :is-facility-page="isFacilityPage"
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
          <img
            v-if="facility.image_url"
            :src="imageCache.cacheableImageUrl(facility.image_url)"
            class="showroom"
          />
          <img v-if="facility.logo_url" :src="facility.logo_url" class="logo" />
        </swiper-slide>
        <swiper-slide v-for="(image, index) in facility.sanitized_images" :key="index">
          <img :src="imageCache.cacheableImageUrl(image.url)" class="showroom" />
        </swiper-slide>
        <div class="pagination" />
      </swiper>

      <div
        class="general-font-size-subtitle is-dark-grey ion-margin-top ion-margin-bottom"
      >
        <img
          src="@/assets/images/check-decagram-outline.svg"
          class="insurance-logo"
          v-if="facility.billable_through_health_insurance_approved"
        />
      </div>

      <div class="tag-chips" v-if="facility.tags.length">
        <ion-button
          mode="md"
          shape="round"
          expand="block"
          class="green-button"
          v-for="tag in displayedTags(facility)"
          :key="tag.id"
        >
          <span class="break-text tag-chip">{{ tag.name }}</span>
        </ion-button>
        <ion-button
          mode="md"
          shape="round"
          class="green-button-plus"
          v-if="facility.tags.length > 3"
          @click.stop="showAllTags(facility)"
        >
          <span v-if="facility.showAllTags">- {{ facility.tags.length - 3 }}</span>
          <span v-else>+ {{ facility.tags.length - 3 }}</span>
        </ion-button>
      </div>

      <div v-if="facility.kind !== 'news'" class="more-infos ion-padding">
        <div>
          <div class="has-text-health headline is-uppercase informations">
            Kontakt und Infos
          </div>
          <ion-grid class="ion-no-padding ion-padding-top">
            <ion-row>
              <ion-col
                size="12"
                size-md="6"
                class="general-font-size is-dark-grey ion-no-padding"
              >
                <div class="informations" v-if="facility.kind !== 'facility'">
                  <div>
                    <ion-icon
                      @click.stop="routeAndGo(facility?.user_care_facility)"
                      class="icons"
                      size="large"
                      :src="facilityIcon"
                    ></ion-icon>
                  </div>
                  <div class="general-font-size">
                    {{ facility?.user_care_facility.name }}
                  </div>
                </div>
                <div class="informations">
                  <div v-if="facility.kind === 'facility'">
                    <div v-if="Capacitor.getPlatform() === 'ios'">
                      <ion-icon
                        @click.stop="openMapsApp(facility.street)"
                        class="icons"
                        size="large"
                        :src="mapIcon"
                      ></ion-icon>
                    </div>
                    <div v-else>
                      <div v-for="geo in facility.geocode_address" :key="geo.id">
                        <a
                          :href="`geo:<${geo.lat}>,<${geo.lon}>?q=<${geo.lat}>,<${geo.lon}>`"
                        >
                          <ion-icon class="icons" size="large" :src="mapIcon"></ion-icon>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <ion-icon class="icons" size="large" :src="mapIcon"></ion-icon>
                  </div>
                  <div class="has-irregular-margin">
                    <div>
                      {{ facility.street }}
                    </div>
                    <div>
                      {{ facility.zip }}
                      <span>
                        {{ facility.town }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="informations">
                  <div>
                    <a class="is-dark-grey" :href="`tel:${facility.phone}`" @click.stop>
                      <ion-icon class="icons" :src="phoneIcon" size="large"></ion-icon>
                    </a>
                  </div>
                  <div>
                    {{ facility.phone }}
                  </div>
                </div>
                <div class="informations hypernate" lang="de">
                  <a
                    class="is-dark-grey centralize"
                    :href="`mailto:${facility.email}`"
                    @click.stop
                  >
                    <ion-icon class="icons" :src="mailIcon" size="large"></ion-icon>
                  </a>

                  <div class="has-irregular-margin-2 mail">
                    {{ facility.email }}
                  </div>
                </div>

                <div v-if="facility.name_instructor">
                  <div
                    class="has-text-health is-uppercase ion-margin-bottom ion-margin-top instructor"
                  >
                    <span>Veranstalter</span>
                  </div>
                  <div
                    class="general-font-size is-dark-grey ion-margin-bottom ion-margin-top"
                  >
                    {{ facility.name_instructor }}
                  </div>
                </div>
              </ion-col>
              <ion-col class="ion-no-padding ion-padding-bottom">
                <div
                  v-if="facility.website"
                  class="button-rounded is-uppercase"
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

            <table class="table-hours is-dark-grey general-font-size">
              <tbody>
                <tr v-for="opening in facility.opening_hours" :key="opening.day">
                  <td class="divider">
                    <span v-if="showHide">{{ opening.day }}</span>
                    <span v-else>{{ opening.day.slice(0, 2) }}</span>
                  </td>

                  <td class="divider" v-if="opening.hours.length">
                    {{ opening.hours }}
                  </td>
                  <td v-else class="divider">Keine Angabe</td>
                </tr>
              </tbody>
            </table>
          </div>
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
            <th>Tag</th>
            <th>Datum</th>
            <th>Uhrzeit</th>
          </thead>
          <tbody>
            <tr v-for="(date, index) in mapDates(facility.event_dates)" :key="index">
              <td class="divider" v-if="showHide">
                {{ date.toLocaleDateString("de-DE", { weekday: "long" }) }}
              </td>
              <td class="divider" v-else>
                {{ date.toLocaleDateString("de-DE", { weekday: "short" }) }}
              </td>
              <td class="divider" v-if="showHide">
                {{ padZero(date.getDate()) }}.{{
                  formattedDateString(date.getMonth() + 1)
                }}.{{ date.getFullYear() }}
              </td>
              <td class="divider" v-else>
                {{ padZero(date.getDate()) }}.{{
                  formattedDateString(date.getMonth() + 1)
                }}.{{ date.toLocaleDateString("de-DE", { year: "2-digit" }) }}
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
        v-html="formatDescription"
        class="general-font-size is-dark-grey hypernate"
        lang="de"
      />
      <div class="ion-margin-bottom general-font-size is-dark-grey">
        <i
          >Inhaltlich verantwortlich: {{ facility?.user?.name }} -
          {{ facility?.user_care_facility?.name }}</i
        >
      </div>
      <div
        v-if="facility.name_responsible_person && facility?.kind === 'news'"
        class="ion-margin-bottom general-font-size is-dark-grey"
      >
        <i>Autor: {{ facility.name_responsible_person }}</i>
      </div>
      <div class="ion-margin-bottom general-font-size is-dark-grey">
        <i>Zuletzt geändert: {{ useDatetime().parseDate(facility.updated_at) }}</i>
      </div>
      <div
        class="more-infos ion-margin-bottom ion-margin-top ion-padding"
        v-if="facility.sanitized_documents.length > 0"
      >
        <div class="has-text-health is-uppercase general-font-size ion-margin-bottom">
          Dokumente
        </div>

        <div
          class="general-font-size is-dark-grey ion-margin-bottom documents"
          v-for="document in facility.sanitized_documents"
          :key="document.signed_id"
          @click="handleLinkClick(document.url)"
        >
          +
          <img src="@/assets/images/download.svg" min-width="24" />
          <span>{{ document.name }}.pdf</span>
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
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper";
import { useRouter } from "vue-router";
import "swiper/css";
import "swiper/css/pagination";
import { computed, ref } from "vue";
import BackButtonLayout from "@/components/general/BackButtonLayout.vue";
import { usePublicApi } from "@/composables/api/public";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { onIonViewDidEnter, IonIcon, getPlatforms, isPlatform } from "@ionic/vue";
import { useRoute } from "vue-router";
import { Browser } from "@capacitor/browser";
import { useImageCache } from "@/composables/ui/imageCache";
import { useDatetime } from "@/composables/ui/datetime";
import facilityIcon from "@/assets/images/facilities/facilities.svg";
import mapIcon from "@/assets/images/facilities/icon_address.svg";
import mailIcon from "@/assets/images/facilities/icon_mail.svg";
import phoneIcon from "@/assets/images/facilities/icon_phone.svg";
import { useFilterStore } from "@/stores/health/searchFilter";
import { Capacitor } from "@capacitor/core";

const route = useRoute();
const loading = ref(false);
const imageCache = useImageCache();

const filterStore = useFilterStore();

const router = useRouter();

const isFacilityPage = ref(true);

const facilityId = computed(() => {
  return route.params.id as string;
});

const showApi = useCollectionApi();
const facility = showApi.item;

const windowSize = ref(window.innerWidth);

const showHide = computed(() => {
  if (windowSize.value > 600) {
    return true;
  }
  return false;
});

const showAllTags = (facility: { showAllTags: boolean }) => {
  facility.showAllTags = !facility.showAllTags;
};

const routeAndGo = (facility: any) => {
  router.push({
    path: `/health/care_facilities/${facility.id}`,
  });
};

const formatDescription = computed(() => {
  if (facility.value) {
    const cleanedDescription = facility.value?.description
      .replace(/(<br>\s*)+/g, "")
      .replace(/(<p>&nbsp;<\/p>\s*)+/g, "<p>&nbsp;</p>");
    return cleanedDescription;
  }
  return "";
});

const padZero = (number: number) => {
  return number < 10 ? "0" + number : number;
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
  if (filterStore.mainSearch) {
    return "/health/search";
  }
  if (route.query?.searchTerm && !isFacilityPage.value) {
    return (filterStore.currentSearchTerm = route.query?.searchTerm as string);
  }
  let baseUrl = `/health/search?kind=${facility.value?.kind}`;
  let serviceTags = route.query?.serviceTags;
  let facilityTags = route.query?.facilityTags;
  let community = route.query?.communities;
  if (serviceTags?.length) {
    baseUrl += `&serviceTags=${serviceTags}`;
  }
  if (facilityTags?.length) {
    baseUrl += `&facilityTags=${facilityTags}`;
  }
  if (community?.length) {
    baseUrl += `&communities=${community}`;
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
  border-radius: 20px

.tags
  font-size: 1.2rem
  span
    margin-right: 10px
.more-infos
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.15)
  border-radius: 10px
  margin-top: 20px
  display: flex
  flex-direction: column
.info-grid
  margin-bottom: 10px
  display: grid
  gap: 2%
  grid-template-columns: 25px auto
  a
    color: #636362
    text-decoration: none

  img
    height: 25px
    width: 25px
    margin-right: 10px
    margin-bottom: -3px
    margin-top: 3px
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
  border-radius: 100px
.logo
  position: absolute
  top: 3%
  right: 3%
  width: 30%
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.15)
  background: white
  border: 1px solid rgba(0, 0, 0, 0.15)
  padding: 1px

.logo img
  width: 100%
  height: 1%
  object-fit: contain
  border-radius: 100px

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
    padding: 5px 20px
    text-align: center

.table-hours
  width: 100%

  td
    padding: 5px 0
    text-align: left

    &:nth-child(2)
      text-align: left
      padding-left: 40px


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
  gap: 5px

ion-chip
  --background: var(--ion-color-health)
  --color: white
  font-size: 1.2rem

.facility-page
  margin-top: 20px
  padding: 10px

.documents
  display: flex
  align-items: center
  gap: 10px

.informations
  display: flex
  flex-wrap: nowrap
  align-items: start
  margin-bottom: 10px

.icons
  height: 25px
  width: 25px
  margin-right: 10px

.has-irregular-margin
  margin-top: -5px

.has-irregular-margin-2
  margin-top: -2px

.tag-chip
  text-transform: none

.instructor
  margin-top: 30px

.mail
  text-transform: lowercase

ion-button
  --padding-top: 10px
  --padding-bottom: 10px
  --padding-start: 10px
  --padding-end: 10px
</style>
