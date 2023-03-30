<template>
  <span class="like-dislike-panel">
    <span @click="handleLike('upvote')">
      <ion-icon :ios="heart" :md="heart" v-if="itemUpvoted" :class="['upvoted', {'is-white' : isWhite}]"></ion-icon>
      <ion-icon :ios="heartOutline" :md="heartOutline" v-else></ion-icon>
    </span>
    <div class="score">{{ itemScore }}</div>
  </span>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue'
import { IonIcon } from '@ionic/vue'
import { heartOutline, heart } from 'ionicons/icons'
import { usePrivateApi } from '@/composables/api/private'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { Vibration } from '@awesome-cordova-plugins/vibration'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  scope: {
    type: String,
    required: true
  },
  isWhite: {
    type: Boolean,
    default: false
  }
})

const api = useCollectionApi()
api.setBaseApi(usePrivateApi())
const loading = ref(false)

const itemUpvoted = ref(false)
const itemDownvoted = ref(false)
const upvoteCount = ref(0)
const downvoteCount = ref(0)
const itemScore = ref(0)

onMounted(() => {
  if (props.item[`has_upvoted_${props.scope}`]) {
    itemUpvoted.value = true
  } else if (props.item[`has_downvoted_${props.scope}`]) {
    itemDownvoted.value = true
  }

  upvoteCount.value = props.item.upvote_count
  downvoteCount.value = props.item.downvote_count
  itemScore.value = props.item.score
})

const handleLike = async (kind: string) => {
  loading.value = true
  if (kind === 'upvote' && itemUpvoted.value || kind === 'downvote' && itemDownvoted.value) {
    api.setEndpoint(`${props.endpoint}/remove_vote`)
    await api.deleteItem()
    itemUpvoted.value = false
    itemDownvoted.value = false
    if (kind === 'upvote') {
      upvoteCount.value -= 1
      itemScore.value -= 1
    } else if (kind === 'downvote') {
      downvoteCount.value -= 1
      itemScore.value += 1
    }
  } else {
    api.setEndpoint(`${props.endpoint}/${kind}`)
    await api.updateItem({})

    if (kind === 'upvote' && !itemUpvoted.value) {
      if (itemDownvoted.value) {
        downvoteCount.value -= 1
        itemScore.value += 1
      }
      itemScore.value += 1
      itemDownvoted.value = false
      itemUpvoted.value = true
      upvoteCount.value += 1
    } else if (kind === 'downvote' && !itemDownvoted.value) {
      if (itemUpvoted.value) {
        upvoteCount.value -= 1
        itemScore.value -= 1
      }
      itemScore.value -= 1
      itemUpvoted.value = false
      itemDownvoted.value = true
      downvoteCount.value += 1
    }
  }

  Vibration.vibrate(500)
  loading.value = false
}
</script>
<style scoped lang="sass">
.like-dislike-panel
  position: relative
  display: flex
  justify-content: flex-start
  align-content: center
.score
  display: inline
  font-size: 18px
  margin-top: 2px
ion-icon
  margin-right: 3px
  font-size: 25px

ion-icon.upvoted
  color: #015281
  &.is-white
    color: white
</style>
