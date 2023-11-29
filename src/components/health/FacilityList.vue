<template>
  <div v-if="filterStore.filteredResults.length > 0">
    <div
      v-for="facility in filterStore.filteredResults"
      :key="facility.id"
      class="facility-box"
      @click="routeAndGo(facility)"
    >
      <div class="is-dark-grey">
        <div
          v-if="facility.kind !== 'facility'"
          @click.stop="routeAndGo(facility?.user_care_facility)"
        >
          <img class="facility-icon" :src="facilityIcon" />
          <span class="general-font-size">{{ facility?.user_care_facility.name }}</span>
          <div class="divider has-gap"></div>
        </div>
        <div class="general-font-size-subtitle is-dark-grey facility-name">
          {{ facility.name }}
        </div>
      </div>
      <div class="general-font-size is-dark-grey">
        <div v-if="facilityKind !== 'news'">
          <div class="informations">
            <div>
              <ion-icon
                @click.stop="openMapsApp(facility.street)"
                class="icons"
                size="large"
                :src="mapIcon"
              ></ion-icon>
            </div>
            <div>
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
        </div>
        <div
          v-if="
            facilityKind === 'facility' ||
            facilityKind === 'news' ||
            !facility?.event_dates.length
          "
        >
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
          <div class="informations">
            <div>
              <a
                class="is-dark-grey informations-mail"
                :href="`mailto:${facility.email}`"
                @click.stop
              >
                <ion-icon class="icons" :src="mailIcon" size="large"></ion-icon>
              </a>
            </div>
            <div>
              {{ facility.email }}
            </div>
          </div>
        </div>

        <div v-else-if="facility?.event_dates.length" class="informations-dates">
          <div>
            <ion-icon class="icons" :src="calendarIcon" size="large"></ion-icon>
          </div>
          <div class="event-chips" v-if="facility?.event_dates.length">
            <span>Nächster Termin:</span>
            
            <div class="dates" v-if="!facility.showAllEvents" mode="ios">
              <span>{{ getDayOfWeek(facility?.event_dates[0].slice(0, 10)) }},</span>
              <span>&nbsp; {{ facility?.event_dates[0].slice(0, 10) }}, </span>
              <span>
                &nbsp;
                {{
                  facility?.event_dates[0].slice(
                    Math.max(facility?.event_dates[0].length - 5, 1)
                  )
                }}
                Uhr</span
              >
              <div>
                <ion-button
              v-if="
                facility.kind !== 'facility' &&
                facility.kind !== 'news' &&
                facility.event_dates.length > 2
              "
              mode="md"
              size="small"
              shape="round"
              expand="block"
              class="green-button"
              @click.stop="showAllEvents(facility)"
              ><span v-if="showMoreButton">+ {{ facility.event_dates.length -1 }}</span>
              </ion-button
            >
              </div>

            </div>
          </div>
        </div>
        <div
          v-if="facility?.event_dates.length && showAllEvents && facility.showAllEvents"
          class="informations"
        >
          <div>
            <ion-icon class="icons" size="large"></ion-icon>
          </div>
          <div>
            <span v-for="event in displayedEvents(facility)" :key="event.index">
              <div class="informations">
                <div class="dates">
                  <span>{{ getDayOfWeek(event.slice(0, 10)) }},&nbsp;</span>
                  <span>{{ event.slice(0, 10) }},&nbsp;</span>
                  <span>{{ event.slice(Math.max(event.length - 5, 1)) }} Uhr</span>
                </div>
              </div>
            </span>
          </div>
        </div>

        <div class="contact" v-if="facilityKind === 'news'">
          <div>
            <span><img src="@/assets/images/watch.svg" /></span>
            {{ useDatetime().parseDatetime(facility.created_at) }}
          </div>
        </div>
        <div class="contact" v-if="facilityKind === 'news'">
          <div v-if="facility.user">
            <span><img src="@/assets/images/user.svg" /></span>
            {{ facility.user.name }}
          </div>
        </div>
        <ion-button
          v-if="
            !router.currentRoute.value.query.kind ||
            facility.kind === 'course' ||
            facility.kind === 'event'
          "
          mode="md"
          shape="round"
          expand="block"
          class="green-button"
          >{{ getFacilityKind(facility) }}</ion-button
        >

        <ion-button
          v-if="facility.kind === 'facility' && router.currentRoute.value.query.kind"
          mode="md"
          shape="round"
          expand="block"
          class="green-button"
          >Details ansehen</ion-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, defineEmits } from "vue";
import {
  useFilterStore,
  filterSortingDirections,
  Facility,
} from "@/stores/health/searchFilter";
import { useRouter } from "vue-router";
import { useDatetime } from "@/composables/ui/datetime";
import mapIcon from "@/assets/images/facilities/icon_address.svg";
import phoneIcon from "@/assets/images/facilities/icon_phone.svg";
import calendarIcon from "@/assets/images/facilities/icon_calendar.svg";
import mailIcon from "@/assets/images/facilities/icon_mail.svg";
import facilityIcon from "@/assets/images/facilities/facilities.svg";
import { isPlatform } from "@ionic/vue";
import mapMarker from "@/assets/images/facilities/icon_map_marker.svg";
import { onIonViewWillEnter } from "@ionic/vue";

const router = useRouter();
const filterStore = useFilterStore();

const showMoreButton = ref(true);

const showAllEvents = (facility: { showAllEvents: boolean }) => {
  facility.showAllEvents = !facility.showAllEvents;
  showMoreButton.value = !showMoreButton.value;
};

const displayedEvents = computed(
  () => (facility: { showAllEvents: any; tags: string | any[] }) => {
    return facility.showAllEvents
      ? facility?.event_dates
      : facility.event_dates.slice(0, 0);
  }
);

const getFacilityKind = (facility) => {
  if (facility && facility.kind === "facility") {
    return "zur Einrichtung";
  } else if (facility && facility.kind === "event") {
    return "zur veranstaltung";
  } else if (facility && facility.kind === "course") {
    return "zum Kurs";
  } else if (facility && facility.kind === "news") {
    return "zum Beitrag";
  }
  return "";
};

const getDayOfWeek = (event: string) => {
  const [day, month, year] = event.split(".").map(Number);
  const currentDate = new Date(year, month - 1, day);
  const daysOfWeek = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const dayIndex = currentDate.getDay();
  return daysOfWeek[dayIndex];
};

defineProps(["facilityKind"]);

const openMapsApp = (location: any) => {
  if (isPlatform("android")) {
    window.location.href = `https://maps.google.com/?q=${location}`;
  } else {
    window.location.href = `maps://maps.apple.com/?q=${location}`;
  }
};

const routeAndGo = (facility: Facility) => {
  filterStore.currentTags;
  router.push({
    path: `/health/care_facilities/${facility.id}`,
    query: {
      tags: JSON.stringify(filterStore.currentTags),
      community: filterStore.currentZip,
    },
  });
};
</script>

<style lang="sass" scoped>
.kind
  background: lightgrey
  color: white
  padding: 3px 7px
  font-style: normal
  font-size: 12px
  font-weight: 600
  line-height: normal
  text-transform: none
  border-radius: 30px
  margin-left: 10px
.facility-box
  padding: 10px
  border-radius: 10px
  background: #FFF
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.15)
  margin-bottom: 20px

.informations
  display: flex
  flex-wrap: wrap
  align-items: center
  margin-bottom: 10px

.informations-dates
  display: flex
  flex-wrap: wrap

.icons
  height: 30px
  width: 30px
  margin-right: 10px

.informations-mail
  display: flex
  flex-wrap: wrap
  align-items: center

.facility-name
  margin-bottom: 10px

a
  text-decoration: none

ion-chip
  --background: var(--ion-color-health)
  --color: white
  font-size: 1.2rem

.event-chips
  display: flex
  flex-direction: column
  align-items: start

.dates
  display: flex
  flex-wrap: wrap
  align-items: center
  margin-bottom: 10px

.dates div:last-child
  margin-left: 10px
.facility-icon
  padding-right: 10px
</style>
