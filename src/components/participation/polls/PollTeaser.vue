<template>
  <div class="poll-box-small" v-if="!(poll.ends_at && useDatetime().isInPast(poll.ends_at))">
    <div @click="emitSetPoll" class="bubble has-cursor-pointer">
      <img src="@/assets/images/poll.svg" />
    </div>
  </div>
</template>

<script lang="ts">
import { useDatetime } from '@/composables/ui/datetime'
import { defineComponent, ref } from 'vue'
export default defineComponent({
  emits: ['setPoll', 'close'],
  props: {
    title: {
      type: String,
      default: ''
    },
    poll: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const emitSetPoll = () => {
      if (props.poll.ends_at && useDatetime().isInPast(props.poll.ends_at)) {
        return
      }
      emit('setPoll', props.poll.id)
    }

    const emitClose = () => {
      emit('close')
    }

    return {
      emitSetPoll,
      emitClose,
      useDatetime
    }
  },
})
</script>

<style lang="sass" scoped>
.poll-box-small
  background: #FFFFFF
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15)
  border-radius: 20px
  width: 270px
  height: 0px
  position: fixed
  bottom: 25%
  right: -20%
  text-align: center
  display: grid
  place-items: center
  z-index: 10000
  transition-timing-function: ease-out
  transition: .3s
  .close
    position: absolute
    right: 0
  .bubble
    background: #EE9207
    border-radius: 50%
    height: 60px
    width: 60px
    display: grid
    place-items: center
    color: white
    font-size: 40px
    position: absolute
</style>