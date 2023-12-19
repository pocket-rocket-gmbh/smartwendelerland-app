<template>
  <!-- <div v-for="facility in filterStore.filteredResults" :key="facility.id" class="facility-box">
    <div class="headline">{{ facility.name }}</div>
    <div class="has-text-health font-size-small tags">
      <span v-for="tag in facility.tags" :key="tag.id">{{ tag.name }}</span>
    </div>

    <div class="body">
      <div class="address font-size-small">
        <div class="street">{{ facility.street }}</div>
        <div class="city"><span>{{ facility.zip }}</span> <span>{{ facility.town }}</span></div>
      </div>
      <div class="contact font-size-small">
        <div><span><img src="@/assets/images/phone.svg"></span> {{ facility.phone }}</div>
        <div><span><img src="@/assets/images/mail.svg"></span> {{ facility.mail }}</div>
      </div>
    </div>
  </div> -->
  <div class="base">
    <div class="mapcontainer">
      <MapWidget
        ref="map"
        :locations="locations"
        :zoomControl="false"
        :center-point="{
          lng: 7.131735,
          lat: 49.523656,
        }"
        :auto-fit="false"
        :min-zoom="11"
        :theme="'green'"
        @markerClick="mapMarkerClick"
      />
    </div>
  </div>
  <ion-modal :is-open="!!clickedLocation">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start" class=" back-button">
          <IonIcon
            @click="clickedLocation = null"
            class="back-button-icon"
            :icon="arrowBackOutline"
          />
        </ion-buttons>
        <ion-title class="ion-no-padding modal-title">
          <span class="is-dark-grey">
            {{ clickedLocation?.name }}
          </span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="projectList">
      <div class="ion-margin-top">
        <FacilityPanel
          v-if="clickedLocation"
          :facility="clickedLocation"
          @goToFacility="navigateToFacility"
          :id="clickedLocation.id"
        />
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import MapWidget from "@/components/MapWidget.vue";
import ParticipationProjectListPanel from "@/components/participation/ProjectListPanel.vue";
import { useFilterStore } from "@/stores/health/searchFilter";
import { MapLocation } from "@/types/MapLocation";
import { IonContent, IonModal, onIonViewDidEnter, IonIcon } from "@ionic/vue";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import FacilityPanel from "./FacilityPanel.vue";
import { arrowBackOutline } from "ionicons/icons";

const filterStore = useFilterStore();
const locations = ref<MapLocation[]>([]);
const clickedLocation = ref<MapLocation>(null);
const router = useRouter();
const map = ref();

watch(
  () => filterStore.filteredResults,
  () => updateLocations()
);

const getLocationsFromFacilies = async (facilities: any[]) => {
  const updatedLocations: MapLocation[] = [];

  for (const facility of facilities) {
    if (
      facility?.geocode_address?.length &&
      facility?.geocode_address[0] &&
      facility?.geocode_address[0]?.lon &&
      facility?.geocode_address[0]?.lat
    ) {
      updatedLocations.push({
        id: facility.id,
        latitude: parseFloat(facility?.geocode_address[0]?.lat),
        longitude: parseFloat(facility?.geocode_address[0]?.lon),
        draggable: false,
        name: facility.name,
        url: `/health/care_facilities/${facility.id}`,
        imageUrl: facility.logo_url,
        kind: facility.kind,
      });
    }

    facility.locations.forEach((location: any) => {
      updatedLocations.push({
        id: facility.id,
        longitude: parseFloat(location.longitude),
        latitude: parseFloat(location.latitude),
        draggable: false,
        name: facility.name,
        url: `/health/care_facilities/${facility.id}`,
        imageUrl: facility.logo_url,
        kind: facility.kind,
      });
    });
  }
  locations.value = updatedLocations;
  setTimeout(function () {
    map.value?.refreshView();
  }, 50);
};

const navigateToFacility = () => {
  router.push({ path: `/health/care_facilities/${clickedLocation.value.id}` });
  clickedLocation.value = null;
};

const updateLocations = () => {
  getLocationsFromFacilies(filterStore.filteredResults);
};

const mapMarkerClick = (marker: MapLocation) => {
  if (!marker.id) return;
  clickedLocation.value = locations.value.find((location) => location.id === marker.id);
};

onMounted(() => {
  updateLocations();
});

onIonViewDidEnter(() => {
  updateLocations();
});
</script>

<style lang="sass" scoped>
.facility-box
  padding: 10px
  border-radius: 10px
  background: #FFF
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.15)
  margin-bottom: 10px
  .headline
    color: #636362
    font-size: 16px
    font-style: normal
    font-weight: 600
    line-height: normal
    text-transform: uppercase
  .tags
    span
      margin-right: 10px
  .body
    margin-top: 10px
    display: grid
    grid-template-columns: 50% 50%
  .contact
    img
      margin-right: 5px
      margin-bottom: -2px

.base
  height: 500px

.mapcontainer
  width: 100vw
  height: 100vh
  position: relative

.close-button
  color: black
  font-size: 20px
  background: transparent
  width: 100%


.back-button-icon
  font-size: 12px
  padding: 10px
  border-radius: 50%
  background: white
  width: 20px
  height: 20px
  border: 1px solid #636362
  margin: 10px

ion-modal
  --width: 100%
  --height: 100%

</style>
