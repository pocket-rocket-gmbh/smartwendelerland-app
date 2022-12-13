<template>
  <BaseLayout>
    <div align="center">
      <PollMain />
    </div>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import PollMain from '@/components/polls/PollMain.vue'
export default defineComponent({
  components: { BaseLayout, PollMain }
})
</script>

<style lang="sass" scoped>

</style>