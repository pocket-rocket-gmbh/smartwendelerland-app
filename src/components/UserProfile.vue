<template>
  <div>
    <img :class="['is-rounded', size]" v-if="user && user.image_url" :src="imageCache.cacheableImageUrl(user.image_url)"  />
    <img src="@/assets/images/user-standard.svg" v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useImageCache } from '@/composables/ui/imageCache'
export default defineComponent({
  props: {
    user: {
      type: Object
    },
    size: {
      type: String,
      default: 'medium'
    }
  },
  setup () {
    const imageCache = useImageCache()
    return {
      imageCache
    }
  }
})
</script>

<style lang="sass" scoped>
.medium
  width: 42px
  height: 42px
</style>