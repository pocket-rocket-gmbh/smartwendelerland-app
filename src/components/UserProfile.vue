<template>
  <div class="mr-2">
    <img :class="['is-rounded', size]" v-if="user.image_url" :src="user.image_url"  />
    <img src="@/assets/images/user-standard.svg" v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    user: {
      type: Object
    },
    size: {
      type: String,
      default: 'medium'
    }
  }
})
</script>

<style lang="sass" scoped>
.medium
  width: 42px
  height: 42px
</style>