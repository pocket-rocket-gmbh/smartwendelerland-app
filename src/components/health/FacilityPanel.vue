<template>
  <ion-card>
    <div class="image-wrapper">
      <img :src="imageCache.cacheableImageUrl(facility.imageUrl)" />
    </div>

    <ion-card-header>
      <ion-card-title>{{ facility.name }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <strong v-if="facility.community && facility.zip && facility.town">
        <ion-icon :icon="location"></ion-icon> {{ facility.community.name }} | {{ facility.zip }} - {{ facility.town }}
      </strong>

      <div class="ion-margin-top">{{ facility.excerpt }}</div>
    </ion-card-content>
    <div class="footer">Einrichtung ansehen</div>
  </ion-card>
</template>

<script setup lang="ts">
import { useImageCache } from "@/composables/ui/imageCache";
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from "@ionic/vue";
import { location } from "ionicons/icons";
import { defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  facility: any;
}>();

const imageCache = useImageCache();
const router = useRouter();
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
</style>
