<template>
  <BackButtonLayout :is-project="true" title="Ideenpinnwände">
    <PublicPinboards />
  </BackButtonLayout>
</template>

<script setup lang="ts">
import BackButtonLayout from '@/components/general/BackButtonLayout.vue';
import PublicPinboards from '@/components/pinboards/PublicPinboards.vue';
</script>

<style lang="sass" scoped>

</style>