<template>
  <ion-nav-link routerLink="/pinboards">
    <div class="box">
      <div><img src="@/assets/images/bulp.svg" /></div>
      <div class="box-headline-right">
        Teile deine Ideen
      </div>
    </div>
  </ion-nav-link>
</template>

<script setup lang="ts">
import { IonNavLink } from '@ionic/vue';
</script>

<style lang="sass" scoped>
.box
  background: linear-gradient(96.86deg, #ABC711 21.73%, #C9CF03 35.08%, #187628 84.5%)
  border-radius: 20px
  height: 125px
  width: 100%
  display: grid
  grid-template-columns: 30% 70%
  place-items: center
</style>