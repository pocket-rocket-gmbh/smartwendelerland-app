<template>
  <div v-if="comment" class="comment-reply">
    <span class="is-clickable" @click="replyBoxOpen = !replyBoxOpen" v-if="showReplyHandle">Antworten ({{ repliesCount}})</span>
    <Transition>
      <div class="replies" v-if="replyBoxOpen">
        <CommentPanel
          v-for="comment in comments" :key="comment.id"
          :comment="comment"
          :show-reply="false"
          :is-reply="true"
          @removeComment="removeComment"
          @setCommentReported="setCommentReported"
        />
        <div class="reply-box">
          <CommentNew
            v-if="useUser().isAdmin()"
            placeholder="Auf Kommentar antworten"
            :project-id="comment.project_id"
            :parent-id="comment.id"
            @increaseRepliesCount="repliesCount += 1"
            @refreshCollection="getItems(false)"
          />
        </div>
      </div>
    </Transition> 
  </div>
  
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { useUser } from '@/composables/user/user'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'
import CommentNew from '@/components/participation/CommentNew.vue'
import CommentPanel from '@/components/participation/CommentPanel.vue'

export default defineComponent({
  components: { CommentNew, CommentPanel },
  props: {
    comment: {
      type: Object,
      required: true
    },
  },
  setup (props) {
    const replyBoxOpen = ref(false)
    const comment = ref(props.comment)
    const repliesCount = ref(comment.value.replies_count)
    const api = useCollectionApi()
    api.setBaseApi(usePrivateApi())
    api.setEndpoint(`comments/${comment.value.id}/replies`)

    const comments = api.items
    const loading = ref(false)
    const currentPage = ref(1)
    const totalPages = ref(1)

    const showReplyHandle = computed(() => {
      if (useUser().isAdmin()) {
        return true
      } else {
        if (comment.value.replies_count > 0) {
          return true
        }
      }
      return false
    })

    watch(replyBoxOpen, () => {
      if (comment.value && replyBoxOpen) {
        currentPage.value = 1
        getItems(false)
      }
    })

    const getItems = async (concat = true) => {
      loading.value = true
      const sortField = 'created_at'
      await api.retrieveCollection({ page: currentPage.value, per_page: 1000, sort_by: sortField, sort_order: 'DESC', searchQuery: null, concat: concat, filters: null })
      loading.value = false
      totalPages.value = api.totalPages.value
    }

    const removeComment = (commentId:string) => {
      const foundItem = comments.value.find(comment => comment.id === commentId)
      const index = comments.value.indexOf(foundItem)
      comments.value.splice(index, 1)
      repliesCount.value -= 1
    }

    const setCommentReported = (commentId:string) => {
      const foundItem = comments.value.find(comment => comment.id === commentId)
      foundItem.has_already_reported_comment = true
    }

    return {
      replyBoxOpen,
      removeComment,
      setCommentReported,
      comments,
      getItems,
      showReplyHandle,
      useUser,
      repliesCount
    }
  }
})
</script>
<style lang="sass" scoped>
.replies
  margin-left: 20px
  margin-top: 20px
.reply-box
  margin-left: -5px
.v-enter-active,.v-leave-active
  transition: 0.5s

.v-enter-from,.v-leave-to
  opacity: 0

</style>
