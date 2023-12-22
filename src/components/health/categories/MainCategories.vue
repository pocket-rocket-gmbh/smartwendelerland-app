<template>
  <ion-grid class="no-margin-padding">
    <ion-row class="categories-row">
      <ion-col
        size-xs="12"
        size-sm="6"
        size-lg="4"
        @click="
          router.push({ path: `/health/search`, query: { kind: 'facility' } })
        "
      >
        <div class="health-category-box">
          <div align="center">
            <img
              src="@/assets/images/main-categories/icon_app_facilities.svg"
            />
          </div>
          <div class="general-font-size-subtitle is-dark-grey text-wrap">Anbietersuche</div>
        </div>
      </ion-col>
      <ion-col
        size-xs="12"
        size-sm="6"
        size-lg="4"
        @click="
          router.push({ path: `/health/search`, query: { kind: 'course' } })
        "
      >
        <div class="health-category-box">
          <div align="center">
            <img src="@/assets/images/main-categories/icon_app_courses.svg" />
          </div>
          <div class="general-font-size-subtitle is-dark-grey">Kurse</div>
        </div>
      </ion-col>
      <ion-col
        size-xs="12"
        size-sm="6"
        size-lg="4"
        @click="
          router.push({ path: `/health/search`, query: { kind: 'event' } })
        "
      >
        <div class="health-category-box">
          <div align="center">
            <img src="@/assets/images/main-categories/icon_app_events.svg" />
          </div>
          <div class="general-font-size-subtitle is-dark-grey">Veranstaltungen</div>
        </div>
      </ion-col>
      <ion-col size-xs="12" size-sm="6" size-lg="4">
        <div
          class="health-category-box"
          @click="
            router.push({ path: `/health/search`, query: { kind: 'news' } })
          "
        >
          <div align="center">
            <img src="@/assets/images/main-categories/icon_app_news.svg" />
          </div>
          <div class="general-font-size-subtitle is-dark-grey">Beiträge</div>
        </div>
      </ion-col>
      <ion-col
        v-for="category in categories"
        :key="category.id"
        size-xs="12"
        size-sm="6"
        size-lg="4"
      >
        <div
          class="health-category-box"
          @click="router.push({ path: `/health/categories/${category.id}` })"
        >
          <div align="center">
            <img
              src="@/assets/images/main-categories/icon_app_health.svg"
              v-if="category.name.includes('Prävention')"
            />
            <img
              src="@/assets/images/main-categories/icon_app_sick.svg"
              v-else
            />
          </div>
          <div class="general-font-size-subtitle is-dark-grey text-wrap">{{ category.name }}</div>
        </div>
      </ion-col>
    </ion-row>
  </ion-grid>
  <!-- <div class="ion-padding">
    <div class="headline title">Du benötigst dringend Hilfe?</div>

    <div class="ion-margin-top health-help-box">
      <div class="general-font-size"><b>Rettungsdienste</b></div>
      Wenn es eine akute Gefahr für das Leben gibt und es nicht ausgeschlossen
      werden kann, dass bleibende Schäden auftreten, sollte unverzüglich der
      Notruf gewählt werden.
      <div>
        <a href="tel:112" class="signal">Wähle den Notruf 112</a>
      </div>
    </div>

    <div class="ion-margin-top health-help-box">
      <div class="general-font-size"><b>Ärztlicher Bereitschaftsdienst</b></div>
      Der Bereitschaftsdienst leistet dir auch an Wochenenden, Feiertagen und in
      der Nacht medizinische Hilfe.
      <div>
        <a href="tel:116117" class="signal">Wähle den Notruf 116 117</a>
      </div>
    </div>

    <div class="ion-margin-top health-help-box">
      <div class="general-font-size"><b>Nummer gegen Kummer</b></div>
      Die "Nummer gegen Kummer" ist eine Anlaufstelle für Kinder und
      Jugendliche, die mit Sorgen und Problemen zu kämpfen haben. Hier findest
      du Unterstützung durch psychologisch geschulte Fachkräfte, die ihre
      Dienste anonym und kostenlos anbieten.
      <div>
        <a href="tel:116123" class="signal">Wähle den Notruf 116123</a>
      </div>
    </div>
  </div> -->

  <ion-loading class="is-dark-grey" mode="md" :is-open="loading" message="Kategorien werden geladen..." />
</template>

<script setup lang="ts">
import { IonGrid, IonRow, IonCol, IonLoading, onIonViewDidEnter } from "@ionic/vue";
import { ref } from "vue";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFilterStore } from "@/stores/health/searchFilter";

const filterStore = useFilterStore();

const router = useRouter();
const loading = ref(false);
const categories = ref([]);
const categoriesApi = useCollectionApi();
categoriesApi.setBaseApi(usePublicApi("health"));

const getCategories = async () => {
  loading.value = true;
  categoriesApi.setEndpoint(`categories`);
  const options = {
    page: 1,
    per_page: 25,
    sort_by: "menu_order",
    sort_order: "ASC",
    searchQuery: null,
    concat: false,
    filters: [],
  };
  await categoriesApi.retrieveCollection(options);
  categories.value = categoriesApi.items.value;
  loading.value = false;
};

onMounted(() => {
  getCategories();
});

</script>

<style lang="sass" scoped>
ion-col
  --ion-grid-column-padding: 10px
.signal
  color: #e84040

ion-grid.no-margin-padding
  margin: -10px

.title
  margin-top: 40px
  font-size: 1.5rem


.health-help-box
  border-radius: 10px
  background: #FFF
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25)
  padding: 15px
  margin: 4px
  align-content: center
  justify-content: center

.categories-row
  margin: 3px -10px
</style>
