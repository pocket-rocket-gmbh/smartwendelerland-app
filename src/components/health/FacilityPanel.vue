<template>
  <ion-card>
    <div class="image-wrapper">
      <img :src="imageCache.cacheableImageUrl(facility.imageUrl)" />
    </div>
    <div class="ion-padding-start ion-padding-bottom">
      <div class="informations general-font-size">
        <div @click.stop="openMapsApp(facility.street)">
          <ion-icon class="icons" size="large" :src="mapIcon"></ion-icon>
        </div>
        <div class="has-irregular-margin">
          <div>
            {{ filterStore.filteredResults[0].street }}
          </div>
          <div>
            {{ filterStore.filteredResults[0].zip }}
            <span>
              {{ filterStore.filteredResults[0].town }}
            </span>
          </div>
        </div>
      </div>

      <div class="informations general-font-size">
        <div>
          <a
            class="is-dark-grey"
            :href="`tel:${filterStore.filteredResults[0].phone}`"
            @click.stop
          >
            <ion-icon class="icons" :src="phoneIcon" size="large"></ion-icon>
          </a>
        </div>
        <div>
          {{ filterStore.filteredResults[0].phone }}
        </div>
      </div>
      <div class="informations general-font-size hypernate" lang="de">
        <a
          class="is-dark-grey centralize mail"
          :href="`mailto:${filterStore.filteredResults[0].email}`"
          @click.stop
        >
          <ion-icon class="icons" :src="mailIcon" size="large"></ion-icon>
        </a>

        <div class="has-irregular-margin-2">
          {{ filterStore.filteredResults[0].email }}
        </div>
      </div>
    </div>
    <div class="footer" @click="goToFacility">Einrichtung ansehen</div>
  </ion-card>
</template>

<script setup lang="ts">
import { useImageCache } from "@/composables/ui/imageCache";
import { defineProps, defineEmits } from "vue";
import { useFilterStore } from "@/stores/health/searchFilter";
import { IonIcon, isPlatform } from "@ionic/vue";
import mapIcon from "@/assets/images/facilities/icon_address.svg";
import mailIcon from "@/assets/images/facilities/icon_mail.svg";
import phoneIcon from "@/assets/images/facilities/icon_phone.svg";

const filterStore = useFilterStore();

const emit = defineEmits(["goToFacility"]);

const props = defineProps<{
  facility: any;
}>();

const openMapsApp = (location: any) => {
  if (isPlatform("android")) {
    window.location.href = `https://maps.google.com/?q=${location}`;
  } else {
    window.location.href = `maps://maps.apple.com/?q=${location}`;
  }
};

const imageCache = useImageCache();

const goToFacility = () => {
  emit("goToFacility");
};
</script>
<style lang="sass" scoped>
.image-wrapper
  position: relative

.metrics
  border-top: 2px solid #D3D3D3
  margin: 20px -20px 0 -20px
  padding-top: 20px
  text-align: center
  &.has-vote-count
    display: grid
    grid-template-columns: 50% 50%
.footer
  background: #8AB61D
  color: white
  display: grid
  place-items: center
  padding: 25px
  font-weight: 600
  font-size: 16px
  line-height: 22px
  text-transform: uppercase

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

.mail
  text-transform: lowercase
</style>
