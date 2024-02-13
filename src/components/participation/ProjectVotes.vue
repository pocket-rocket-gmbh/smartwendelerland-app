<template>
  <div>
    <div
      v-if="totalVoteCount > 0 && project.rating_results_public"
      :class="{ 'is-small': isSmall }"
    >
      <div class="votebar-wrap">
        <div class="result">
          <span> {{ upvoteCount }} gefällt dieses Projekt </span>
          <img src="@/assets/images/like.png" class="like-button" />
        </div>
      </div>

      <div class="votebar-wrap">
        <div
          v-if="project.rating_kind === 'upvote_downvote' && downvoteRelation > 0"
          class="votebar downvote"
          :style="`width: ${downvoteRelation}%;`"
        />
        <div class="result" v-if="downvoteCount > 0">
          {{ downvoteCount }} gefällt dieses Projekt nicht
        </div>
      </div>
    </div>
    <div v-else-if="!project.rating_results_public">Ergebnis noch nicht freigegeben</div>
    <div v-else>Noch keine Abstimmung</div>      
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
export default defineComponent({
  name: "PublicComments",
  props: {
    project: Object,
    isSmall: {
      type: Boolean,
      default: false,
    },
    showVoteCount: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const totalVoteCount = computed(() => {
      return props.project.total_vote_count;
    });
    const upvoteCount = computed(() => {
      return props.project.upvote_count;
    });
    const downvoteCount = computed(() => {
      return props.project.downvote_count;
    });
    const upvoteRelation = computed(() => {
      return (
        (parseFloat(props.project.upvote_count) /
          parseFloat(props.project.total_vote_count)) *
        100
      );
    });

    const downvoteRelation = computed(() => {
      return (
        (parseFloat(props.project.downvote_count) /
          parseFloat(props.project.total_vote_count)) *
        100
      );
    });

    return {
      totalVoteCount,
      upvoteCount,
      downvoteCount,
      upvoteRelation,
      downvoteRelation
    };
  },
});
</script>
<style lang="sass" scoped>
.votebar-wrap
  width: 100%
.votebar
  position: relative
  height: 20px
  transition: 0.5s
  overflow: initial
  border-radius: 80px
.votebar.upvote
  background: #ABC812
.votebar.downvote
  background: #A42258

.result
  font-size: 20px
  color: #58595E
  font-style: normal
  font-weight: 600
  margin-top: 10px
  display: flex
  align-items: center
  justify-content: center
  gap: 10px
.is-small .result
  top: 10px

.like-button
  width: 40px
</style>
