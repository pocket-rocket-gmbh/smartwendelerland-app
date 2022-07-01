<template>
  <page-layout title="Übersicht">
    <wip-layout />
  </page-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import WipLayout from '@/components/WipLayout.vue'

export default defineComponent({
  name: 'OverviewPage',
  components: { PageLayout, WipLayout }
})
</script>
