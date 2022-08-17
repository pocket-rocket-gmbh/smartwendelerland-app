<template>
  <div>
    <div v-if="totalVoteCount > 0" :class="{'is-small' : isSmall}">
      <div class="votebar-wrap">
        <div v-if="upvoteRelation > 0" class="votebar upvote" :style="`width: ${upvoteRelation}%;`">
          <div class="result">{{ upvoteCount }} dafür</div>
        </div>
      </div>
      
      <div class="votebar-wrap">
        <div v-if="downvoteRelation > 0" class="votebar downvote" :style="`width: ${downvoteRelation}%;`">
          <div class="result">{{ downvoteCount }} dagegen</div>
        </div>
      </div>
      
      <div class="ion-margin-top">
        Abgegebene Stimmen: {{ totalVoteCount }}
      </div>
    </div>
    <div v-else>Noch keine Abstimmung</div>
  </div>
  
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
export default defineComponent({
  name: 'PublicComments',
  props: {
    project: Object,
    isSmall: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const totalVoteCount = computed(() => {
      return props.project.total_vote_count
    })
    const upvoteCount = computed(() => {
      return props.project.upvote_count
    })
    const downvoteCount = computed(() => {
      return props.project.downvote_count
    })
    const upvoteRelation = computed(() => {
      return (parseFloat(props.project.upvote_count) / parseFloat(props.project.total_vote_count)) * 100
    })

    const downvoteRelation = computed(() => {
      return (parseFloat(props.project.downvote_count) / parseFloat(props.project.total_vote_count)) * 100
    })

    return {
      totalVoteCount,
      upvoteCount,
      downvoteCount,
      upvoteRelation,
      downvoteRelation
    }
  }
})
</script>
<style lang="css" scoped>
.votebar-wrap {
  width: 100%;
  background: #dcdcdc;
}
.votebar {
  position: relative;
  height: 40px;
  transition: 0.5s;
  overflow: initial;
}
.votebar.upvote {
  background: #ABC812;
}
.votebar.downvote {
  background: #A42258;
}
      
.result {
  position: absolute;
  left: 5px;
  top: 8px;
  width: 150px;
  color: white;
}
.is-small .result {
  top: 10px;
}
</style>