<template>
  <BackButtonLayout>
    <div align="center">
      <PollMain />
    </div>
  </BackButtonLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import PollMain from '@/components/polls/PollMain.vue'
export default defineComponent({
  components: { BackButtonLayout, PollMain }
})
</script>

<style lang="sass" scoped>

</style>