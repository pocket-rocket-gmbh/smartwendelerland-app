<template>
  <span v-if="comment">
    <span class="is-clickable" @click="replyBoxOpen = !replyBoxOpen" v-if="showReplyHandle">Antworten ({{ comment.replies_count}})</span>
    <Transition>
    <div class="replies" v-if="replyBoxOpen">
      <PublicCommentsComment
        v-for="comment in comments" :key="comment.id"
        :comment="comment"
        :show-reply="false"
        @removeComment="removeComment"
      />

      <PublicCommentsNew
        v-if="useUser().isAdmin()"
        placeholder="Auf Kommentar antworten"
        :project-id="comment.project_id"
        :parent-id="comment.id"
        @refreshCollection="getItems(false)"
      />
    </div>
  </Transition>
  </span>
  
</template>
<script>
export default defineComponent({
  name: 'Reply',
  props: {
    comment: {
      type: Object,
      required: true
    },
  },
  setup (props) {
    const replyBoxOpen = ref(false)
    const comment = ref(props.comment)
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

    const removeComment = (commentId) => {
      const foundItem = comments.value.find(comment => comment.id === commentId)
      const index = comments.value.indexOf(foundItem)
      comments.value.splice(index, 1)
    }

    return {
      replyBoxOpen,
      comment,
      removeComment,
      comments,
      getItems,
      showReplyHandle
    }
  }
})
</script>
<style lang="sass" scoped>
.replies
  margin-left: 30px

.v-enter-active,.v-leave-active
  transition: 0.5s

.v-enter-from,.v-leave-to
  opacity: 0

</style>
