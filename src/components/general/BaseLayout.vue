<template>
  <ion-page>
    <ion-header mode="md">
      <ion-toolbar>
        <img
          @click="$router.push({ path: '/' })"
          :src="setLogo"
          class="logo-header"
          slot="start"
        />
        <ion-icon
          v-if="!useUser().loggedIn() && projekRoute"
          @click="router.push('/login')"
          router-link="/login"
          :ios="logInOutline"
          :md="logInSharp"
          slot="end"
        ></ion-icon>
        <div
          v-else-if="projekRoute"
          @click="router.push('/me')"
          router-link="/me"
          slot="end"
        >
          <UserProfile :user="useUser().currentUser()" />
        </div>
        <ion-icon
          v-if="healthRoute && showSearchBar && !tutorialIsOpen"
          @click="toogleSearchBar"
          :icon="close"
          class="search-icon toogle-search-bar"
        ></ion-icon>
        <ion-icon
          v-if="healthRoute && !showSearchBar && !tutorialIsOpen"
          @click="toogleSearchBar"
          :icon="searchOutline"
          class="search-icon toogle-search-bar"
        ></ion-icon>
      </ion-toolbar>
      <ion-toolbar v-if="healthRoute && showSearchBar" mode="md">
        <div class="divider"></div>
        <SearchBar
          class="search-bar"
          :loading="loading"
          @handleSearch="handleSearch"
          :header="true"
          :debounce="2000"
          :set-focus="true"
        />
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { IonPage, IonHeader, IonToolbar, IonIcon, IonContent } from "@ionic/vue";
import { useRouter } from "vue-router";
import { logInOutline, logInSharp } from "ionicons/icons";
import UserProfile from "@/components/UserProfile.vue";
import { useUser } from "@/composables/user/user";
import SearchBar from "@/components/health/SearchBar.vue";
import { useFilterStore } from "@/stores/health/searchFilter";
import { searchOutline, close } from "ionicons/icons";
import logoParticipation from "@/assets/images/logo-participation.png";
import logoHealth from "@/assets/images/logo-health.png";
import logoMain from "@/assets/images/logo.png";

const router = useRouter();
const route = router.currentRoute;

watch(router.currentRoute, () => {
  showSearchBar.value = false
});

const loading = ref(false);
const filterStore = useFilterStore();

const showSearchBar = ref(false);

const toogleSearchBar = () => {
  showSearchBar.value = !showSearchBar.value;
};

const projekRoute = computed(() => {
  if (route.value.path.includes("participation")) {
    return true;
  }
  return false;
});

const tutorialIsOpen = computed(() => {
  if (route.value.path.includes("landing")) {
    return true;
  }
  return false;
});

const handleSearch = async () => {
  if (checkRoute()) return;
  loading.value = true;
  filterStore.currentKinds = [];
  filterStore.onlySearchInTitle = false;
  if (filterStore.currentSearchTerm.length > 0) {
    await filterStore.loadAllResults();
    router.push({ path: "/health/search" });
  }
  loading.value = false;
  showSearchBar.value = false;
};

const healthRoute = computed(() => {
  if (route.value.path.includes("health")) {
    return true;
  }
  return false;
});

const setLogo = computed(() => {
  if (projekRoute.value) {
    return logoParticipation;
  }
  if (healthRoute.value) {
    return logoHealth;
  }
  return logoMain;
});

const checkRoute = () => {
  if (route.value.query["kind"]) {
    return true;
  }
  return false;
};

</script>

<style lang="sass">
.logo-header
  height: 60px
  margin-left: 10px
ion-icon
  font-size: 32px
  margin-right: 10px

ion-toolbar
  --min-height: 70px

.main-toolbar
  display: flex
  align-items: center
  align-content: center
  flex-wrap: wrap

.search-icon
  color: #636362

.toogle-search-bar
  display: flex
  align-items: center
  align-content: center
  flex-wrap: wrap
  margin-left: 10px
  margin-left: auto
  justify-content: end

ion-item-divider
  --padding-top: 0px
  --padding-bottom: 0px
  --padding-start: 0px
  --padding-end: 0px
</style>
