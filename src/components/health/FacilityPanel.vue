<template>
  <ion-card>
    <ion-card-content>
      <div class="image-wrapper ion-padding-bottom">
        <img :src="imageCache.cacheableImageUrl(facility.imageUrl)" />
      </div>
      <div class="ion-padding-start ion-padding-bottom">
        <div class="informations general-font-size">
          <div v-if="Capacitor.getPlatform() === 'ios'">
            <ion-icon
              @click.stop="openMapsApp(facility.street)"
              class="icons"
              size="large"
              :src="mapIcon"
            ></ion-icon>
          </div>
          <div v-else>
            <div v-if="facility.geocode_address && facility.geocode_address.length > 0">
              <a
                :href="`geo:<${facility.geocode_address[0].lat}>,<${facility.geocode_address[0].lon}>?q=<${facility.geocode_address[0].lat}>,<${facility.geocode_address[0].lon}>`"
              >
                <ion-icon class="icons" size="large" :src="mapIcon"></ion-icon>
              </a>
            </div>
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
    </ion-card-content>
    <div class="footer" @click="goToFacility">Zum Anbieter</div>
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
import { Capacitor } from "@capacitor/core";

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
