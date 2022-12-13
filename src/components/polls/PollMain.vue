<template>
  <div class="ion-padding">
    <div class="poll poll-box" :style="{ minHeight: `${pollQuestions.length * 230}px`}">
      <div class="icons-top">
        <div v-if="questionAnswered" class="bubble-green">OK</div>
        <div v-else class="bubble"><img src="@/assets/images/poll.svg" /></div>
      </div>
      <div class="content" v-if="!questionAnswered">
        <div class="headline big has-text-grey ion-margin">
          <span v-if="(isPublic && usePollStore().publicPoll)">{{ usePollStore().publicPoll.name }}</span>
          <span v-else-if="usePollStore().projectPoll">{{ usePollStore().projectPoll.name }}</span>
        </div>
        <div class="has-text-primary is-size-small ion-margin">Dauert weniger als 1 Minute</div>
        <div v-for="pollQuestion in pollQuestions" :key="pollQuestion.id" class="mt-5">
          <label align="left">{{ pollQuestion.name }}</label>
          <div v-if="pollQuestion.kind === 'rating'" class="ion-margin">
            <span v-for="i in pollQuestion.max_score_count" :key="i" class="star">
              <img
                v-if="starArray[pollQuestion.id]"
                :src="`/star-${starArray[pollQuestion.id][i-1]}.svg`"
                @mouseover="setStarMouseover(pollQuestion, i-1)"
                @mouseout="setStarMouseout(pollQuestion, i-1)"
                @click="setStars(pollQuestion, i)"
              />
            </span>
          </div>
          <div v-else-if="pollQuestion.kind === 'single_choice' && answersArray[pollQuestion.id]" class="ion-margin">
            <ion-radio-group v-model="answersArray[pollQuestion.id].choices_answers">
              <ion-item v-for="choice in pollQuestion.choices" :key="choice.id">
                <ion-label>{{ choice.possible_answer }}</ion-label>
                <ion-radio slot="end" :value="choice.id"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
          <div v-else-if="pollQuestion.kind === 'multiple_choice' && answersArray[pollQuestion.id]" class="ion-margin">
            <ion-item v-for="choice in pollQuestion.choices" :key="choice.id">
              
              <label>
                <input type="checkbox" :value="choice.id" v-model="answersArray[pollQuestion.id].choices_answers" slot="start" />
                {{ choice.possible_answer }}
              </label>
            </ion-item>
          </div>
          <div v-else-if="pollQuestion.kind === 'text' && answersArray[pollQuestion.id]">
            <textarea placeholder="Antwort eingeben…" v-model="answersArray[pollQuestion.id].text_value"></textarea>
          </div>
        </div>
      </div>
      <div v-else>
        <p class="headline big has-text-grey">VIELEN DANK</p>
        <p class="headline big has-text-grey">FÜR DEINE MEINUNG</p>
      </div>
      <div :class="['footer', { 'inactive' : !completedQuestionsNoText }]" @click="storeResults">Absenden</div>
    </div>
  </div>
</template>

<script lang="ts">
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'
import { IonRadioGroup, IonItem, IonLabel, IonRadio } from '@ionic/vue'
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePollStore } from '@/stores/poll'
export default defineComponent({
  components: { IonRadioGroup, IonItem, IonLabel, IonRadio },
  emits: ['close'],
  setup(props, { emit }) {
    const pollId = computed(() => {
      return router.currentRoute.value.params.id
    })

    const isPublic = computed(() => {
      return router.currentRoute.value.query.is_public === 'true'
    })

    const api = useCollectionApi()
    const router = useRouter()
    api.setBaseApi(usePrivateApi())
    api.setEndpoint(`poll_questions/poll/${pollId.value}`)

    const answersApi = useCollectionApi()
    answersApi.setBaseApi(usePrivateApi())

    const loading = ref(false)
    const pollQuestions = api.items
    const starArray = ref([])
    const answersArray = ref([])
    const answersArraySanitized = ref([])
    const questionAnswered = ref(false)

    const getPoll = async () => {
      loading.value = true
      await api.retrieveCollection({ page: 1, per_page: 5, sort_by: 'menu_order', sort_order: 'ASC', searchQuery: null, concat: false, filters: null })
      setAnswersArray()
      loading.value = false
    }

    const emitClose = () => {
      emit('close')
    }

    const setStarMouseover = (pollQuestion:any, index:any) => {
      for (let i = 0; i < index+1; i++) {
        starArray.value[pollQuestion.id][i] = 'gold'
      }
    }
    const setStarMouseout = (pollQuestion:any, index:any) => {
      for (let i = 0; i < index+1; i++) {
        starArray.value[pollQuestion.id][i] = 'grey'
      }

      // for already given answers
      if (answersArray.value[pollQuestion.id].rating_value > 0) {
        for (let i = 0; i < answersArray.value[pollQuestion.id].rating_value; i++) {
          starArray.value[pollQuestion.id][i] = 'gold'
        }
      }
    }
    const setStars = async (pollQuestion:any, rating:any) => {
      answersArray.value[pollQuestion.id].rating_value = rating

      // reset stars if already given
      for (let i = rating; i <= pollQuestion.max_score_count; i++) {
        starArray.value[pollQuestion.id][i] = 'grey'
      }
    }

    const setAnswersArray = () => {
      pollQuestions.value.forEach(question => {
        if (question.kind === 'rating') {
          starArray.value[question.id] = {}
          answersArray.value[question.id] = {
            rating_value: 0
          }
          
          for (let i = 0; i < question.max_score_count; i++) {
            starArray.value[question.id][i] = 'grey'
          }
        } else if (question.kind === 'single_choice' || question.kind === 'multiple_choice') {
          answersArray.value[question.id] = {
            choices_answers: []
          }
        } else if (question.kind === 'text') {
          answersArray.value[question.id] = {
            text_value: ''
          }
        }
      })
    }

    const storeResults = async () => {
      if (completedQuestionsNoText.value) {
        pollQuestions.value.forEach(question => {
          if (answersArray.value[question.id].rating_value) {
            answersArraySanitized.value.push({
              poll_question_id: question.id,
              rating_value: answersArray.value[question.id].rating_value
            })
          }
          if (answersArray.value[question.id].text_value) {
            answersArraySanitized.value.push({
              poll_question_id: question.id,
              text_value: answersArray.value[question.id].text_value
            })
          }
          if (answersArray.value[question.id].choices_answers) {
            answersArraySanitized.value.push({
              poll_question_id: question.id,
              choices_answers: answersArray.value[question.id].choices_answers
            })
          }
        })

        await answersArraySanitized.value.forEach(answer => {
          answersApi.setEndpoint(`poll_answers/poll_question/${answer.poll_question_id}`)
          const result = answersApi.createItem(
            { rating_value: answer.rating_value, text_value: answer.text_value, choices_answers: answer.choices_answers }
          )
        })
        console.log(answersArraySanitized)
        //questionAnswered.value = true

        //localStorage.setItem(`smawela_poll_completed_${props.pollId}`, 'true')
      }
    }

    const completedQuestionsNoText = computed(() => {
      let count = 0
      let questions = 0
      pollQuestions.value.forEach(question => {
        if (question.kind === 'rating') {
          questions += 1
          if (answersArray.value[question.id] && answersArray.value[question.id].rating_value) {
            count += 1
          }
        } else if (question.kind === 'single_choice' || question.kind === 'multiple_choice') {
          questions += 1
          if (answersArray.value[question.id] && answersArray.value[question.id].choices_answers && answersArray.value[question.id].choices_answers.length > 0) {
            count += 1
          }
        }
      })
      return count === questions
    })

    onMounted(() => {

      // check if poll already answered
      if (localStorage.getItem(`smawela_poll_completed_${pollId.value}`)) {
        questionAnswered.value = true
      }

      getPoll()
    })

    return {
      pollQuestions,
      emitClose,
      starArray,
      setStarMouseover,
      setStarMouseout,
      setStars,
      questionAnswered,
      storeResults,
      answersArray,
      completedQuestionsNoText,
      usePollStore,
      isPublic
    }
  },
})
</script>

<style lang="sass" scoped>
.poll
  width: 100%
  top: 50%
  left: 50%
  margin-right: -50%
  transform: translate(-50%, -50%)
  .content
    padding: 20px
    
  label
    color: #58595E
    font-size: 18px
    font-weight: 900
  textarea
    border-bottom: 2px solid #58595E
    width: 100%
    padding: 3px
    height: 110px
  .star
    margin: 0 10px
    cursor: pointer


</style>