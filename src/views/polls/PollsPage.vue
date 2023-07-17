<template>
  <BackButtonLayout>
    <div align="center">
      <PollMain
        @close="goBack"
      />
    </div>
  </BackButtonLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import PollMain from '@/components/polls/PollMain.vue'
import { useRouter } from 'vue-router'
export default defineComponent({
  components: { BackButtonLayout, PollMain },
  emits: ['close'],
  setup () {

    const router = useRouter()

    const goBack = () => {
      router.go(-1)
    }

    return {
      goBack
    }
  }
})
</script>

<style lang="sass" scoped>

</style>