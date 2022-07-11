<template>
  <base-layout>
    <WipLayout />
  </base-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import WipLayout from '@/components/WipLayout.vue'

export default defineComponent({
  name: 'MePage',
  components: { WipLayout, BaseLayout }

  // TODO send to login screen if not logged in
})
</script>
