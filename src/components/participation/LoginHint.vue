<template>
  <div class="login-hint" @click="router.push('/login')">
    {{ label }}
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
  background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)
  color: white
  padding: 10px
  border-radius: 20px
</style>