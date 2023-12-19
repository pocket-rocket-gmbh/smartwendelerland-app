<template>
  <ion-grid>
    <ion-row class="ion-justify-content-center">
      <ion-col size-sm="12" size-md="12" size-lg="12">
        <div class="general-font-size">
          <swiper
            :slides-per-view="1"
            :space-between="20"
            :modules="modules"
            :pagination="{ el: '.pagination' }"
          >
            <swiper-slide>
              <div class="slide">
                <div class="circle">
                  <img src="@/assets/images/tutorial/icon_virus.svg" />
                </div>
                <div class="headline" lang="de">
                  Willkommen in der gesundesWND-App
                </div>
                <div class="hypernate ion-no-padding tutorial-description" lang="de">
                  Gesundheitsanbieter, News, Veranstaltungen- wir informieren dich rund um
                  dieThemen Gesundheit, Prävention und Pflege im Smart Wendeler Land.
                </div>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="slide">
                <div class="circle">
                  <img src="@/assets/images/main-categories/icon_app_facilities.svg" />
                </div>
                <div class="headline" lang="de">
                  Erlebe das Gesundheitsangebot im Smart Wendeler Land
                </div>
                <div class="hypernate ion-no-padding tutorial-description" lang="de">
                  Lass dich inspirieren oder finde mit unserer Such- und Filterfunktion
                  gezielt den passenden Gesundheitsanbieter für dich.
                </div>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="slide">
                <div class="circle">
                  <img src="@/assets/images/main-categories/icon_app_events.svg" />
                </div>
                <div class="headline" lang="de">
                  Entdecke vielfältige Veranstaltungs- und Kursangebote
                </div>
                <div class="hypernate ion-no-padding tutorial-description" lang="de">
                  Wir unterstützen dich bei der Suche nach dem passenden Präventionskurs
                  aus den Bereichen Entspannung, Ernährung, Fitness oder Sucht und
                  informiere dich über bevorstehende Events.
                </div>
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
  <div class="bottom-skip-tutorial general-font-size" @click="skipIntro">
    Intro überspringen
  </div>
</template>

<script lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { defineComponent } from "vue";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "LandingPage",
  components: { IonGrid, IonRow, IonCol, Swiper, SwiperSlide },
  setup() {
    const router = useRouter();
    const skipIntro = () => {
      localStorage.setItem("gesundheitsplattform_tutorial_skipped", "true");
      router.push({ path: "/health/categories" });
    };
    return {
      skipIntro,
      modules: [Pagination],
    };
  },
});
</script>

<style lang="sass" scoped>
.slide
  background: linear-gradient(74deg, #91A80D 0%, #BAC323 38.19%, #9EA100 95.31%)
  border-radius: 20px
  height: 65vh
  text-align: center
  color: #FFFFFF
  padding: 20px 20px 20px 20px
  position: relative
  display: flex
  flex-direction: column
  justify-content: center
  gap: 30px
  @media (max-width: 365px)
    gap: 10px
    height: 60vh
  .circle
    margin: 0 auto
    background: white
    width: 110px
    height: 110px
    border: 5px solid #007344
    border-radius: 50%
    display: grid
    place-items: center
    @media (max-width: 365px)
      width: 70px
      height: 70px
    img
      width: 70%
      margin-top: -5px
      @media (max-width: 365px)
        margin-top: 0px
  .headline
    font-style: normal
    font-weight: 500
    font-size: 27px
    color: #FFFFFF
    margin: 10px 0
.pagination
  text-align: center
.forward
  background: var(--ion-color-health)
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
  background: linear-gradient(74deg, #91A80D 0%, #BAC323 38.19%, #9EA100 95.31%)
  text-transform: uppercase
  color: white
  height: 72px
  width: 100%
  display: grid
  place-items: center
  position: absolute
  bottom: 0

.swiper-pagination-bullet .swiper-pagination-bullet-active
  background-color: black!important
  color: red!important
</style>
