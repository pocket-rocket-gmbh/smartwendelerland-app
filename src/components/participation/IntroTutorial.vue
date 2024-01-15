<template>
  <ion-grid>
    <ion-row class="ion-justify-content-center">
      <ion-col size-sm="12" size-md="6" size-lg="3">
        <div>
          <swiper
            :slides-per-view="1"
            :space-between="20"
            :modules="modules"
            :pagination="{ el: '.pagination' }"
          >
            <swiper-slide>
              <div class="slide">
                <div class="circle">
                  <img src="@/assets/images/tutorial-sheep.png" />
                </div>
                <div class="headline">“Willkommen in der Smart Wendeler App”</div>
                <p>In diesem Intro erfährst du, was du in der App machen kannst.</p>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="slide">
                <div class="circle">
                  <img src="@/assets/images/tutorial-rating.png" />
                </div>
                <div class="headline">Bürgerumfragen</div>
                <p>Nimm an Umfragen teil und sag uns deine Meinung.</p>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="slide">
                <div class="circle">
                  <img src="@/assets/images/tutorial-poll.svg" />
                </div>
                <div class="headline">Projekte bewerten</div>
                <p>Gib deine Stimme zu einem Projekt ab und gestalte mit.</p>
              </div>
            </swiper-slide>
            <swiper-slide v-slot="{ isActive }">
              <div class="slide">
                <div class="circle">
                  <img src="@/assets/images/tutorial-feedback.png" />
                </div>
                <div class="headline">Community</div>
                {{ setIsActive(isActive) }}
                <p>
                  Kommuniziere mit dem Projektteam und Projektbeteiligten, oder teile das
                  Projekt mit Freunden.
                </p>
              </div>
            </swiper-slide>
            <div class="pagination" />
          </swiper>

          <!-- <PollsBox
            :is-public="true"
          /> -->
        </div>
      </ion-col>
    </ion-row>
  </ion-grid>
  <div class="bottom-skip-tutorial" @click="skipIntro">Intro {{ introText }}</div>
</template>

<script lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { defineComponent, ref } from "vue";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "LandingPage",
  components: { IonGrid, IonRow, IonCol, Swiper, SwiperSlide },
  setup() {
    const router = useRouter();
    const skipIntro = () => {
      localStorage.setItem("projektplattform_tutorial_skipped", "true");
      router.push({ path: "/participation/projects" });
    };

    const introText = ref("");

    const setIsActive = (isActive: boolean) => {
      if (isActive) {
        introText.value = "Abschließen";
      } else {
        introText.value = "Überspringen";
      }
    };

    return {
      skipIntro,
      setIsActive,
      introText,
      modules: [Pagination],
    };
  },
});
</script>

<style lang="sass" scoped>
.slide
  background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)
  border-radius: 20px
  height: 60vh
  text-align: center
  color: #FFFFFF
  padding: 40px 20px 20px 20px
  position: relative
  .circle
    margin: 0 auto
    background: #3CB5E7
    width: 150px
    height: 150px
    border: 11px solid #004E79
    border-radius: 50%
    display: grid
    place-items: center
    img
      width: 90%
      margin-left: 10px
      margin-top: -10px
  .headline
    font-style: normal
    font-weight: 500
    font-size: 25px
    line-height: 22px
    letter-spacing: 0.09em
    text-transform: uppercase
    color: #FFFFFF
    margin: 40px 0
.pagination
  text-align: center
.forward
  background: linear-gradient(19deg, #FEE02D 37.19%, #D3A604 77.42%)
  border-radius: 20px
  text-transform: uppercase
  padding: 10px 30px
  position: absolute
  width: 80%
  bottom: 3%
  margin-left: auto
  margin-right: auto
  left: 0
  right: 0

.bottom-skip-tutorial
  background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)
  text-transform: uppercase
  color: white
  height: 72px
  width: 100%
  display: grid
  place-items: center
  position: absolute
  bottom: 0
</style>
