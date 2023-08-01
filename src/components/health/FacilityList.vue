<template>
  <div v-for="facility in filterStore.filteredResults" :key="facility.id" class="facility-box" @click="router.push({ path: `/health/care_facilities/${facility.id}`})">
    <div class="headline">{{ facility.name }}</div>
    <div class="has-text-health font-size-small tags">
      <span v-for="tag in facility.tags" :key="tag.id">{{ tag.name }}</span>
    </div>

    <div class="body">
      <div class="address font-size-small" v-if="facilityKind !== 'news'">
        <div class="street">{{ facility.street }}</div>
        <div class="city"><span>{{ facility.zip }}</span> <span>{{ facility.town }}</span></div>
      </div>
      <div class="contact font-size-small" v-if="facilityKind !== 'news'">
        <div v-if="facility.phone"><span><img src="@/assets/images/phone.svg"></span> {{ facility.phone }}</div>
        <div v-if="facility.mail"><span><img src="@/assets/images/mail.svg"></span> {{ facility.mail }}</div>
      </div>

      <div class="contact" v-if="facilityKind === 'news'">
        <div><span><img src="@/assets/images/watch.svg"></span> {{ useDatetime().parseDatetime(facility.created_at) }}</div>
      </div>
      <div class="contact" v-if="facilityKind === 'news'">
        <div v-if="facility.user"><span><img src="@/assets/images/user.svg"></span> {{ facility.user.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useFilterStore, filterSortingDirections } from "@/stores/health/searchFilter";
import { useRouter } from "vue-router";
import { useDatetime } from '@/composables/ui/datetime';
const router = useRouter()
const filterStore = useFilterStore();

defineProps(['facilityKind'])
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
  </style>