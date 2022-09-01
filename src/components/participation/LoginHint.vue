<template>
  <div class="login-hint" @click="router.push('/login')">
    <u>{{ label }}</u>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
export default defineComponent({
  props: {
    label: {
      type: String,
      required: true
    }
  },
  setup () {
    const router = useRouter()
    return {
      router
    }
  }
})
</script>
<style lang="sass" scoped>
.login-hint
  background: #015281
  color: white
  padding: 10px
</style>