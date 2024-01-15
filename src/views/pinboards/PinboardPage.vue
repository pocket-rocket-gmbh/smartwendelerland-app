<template>
  <BackButtonLayout title="Ideen" :has-ideas="true" force-back="/pinboards" >
    <PublicPinboard />
  </BackButtonLayout>
</template>

<script setup lang="ts">
import BackButtonLayout from '@/components/general/BackButtonLayout.vue';
import PublicPinboard from '@/components/pinboards/PublicPinboard.vue';
</script>

<style lang="sass" scoped>

</style>