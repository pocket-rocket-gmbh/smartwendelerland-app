<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <img
          @click="$router.push({ path: '/' })"
          src="@/assets/images/logo.png"
          class="logo"
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

        <SearchBar
          v-if="healthRoute"
          class="search-bar"
          :loading="loading"
          @handleSearch="handleSearch"
          :header="true"
        />
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonContent,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { logInOutline, logInSharp } from "ionicons/icons";
import UserProfile from "@/components/UserProfile.vue";
import { useUser } from "@/composables/user/user";
import SearchBar from "@/components/health/SearchBar.vue";
import { useFilterStore } from "@/stores/health/searchFilter";

const router = useRouter();
const route = router.currentRoute;

const loading = ref(false);
const filterStore = useFilterStore();

const projekRoute = computed(() => {
  if (route.value.path.includes("participation")) {
    return true;
  }
  return false;
});

const handleSearch = async () => {
  loading.value = true;
  filterStore.currentKinds = [];
  filterStore.onlySearchInTitle = false;
  if (filterStore.currentSearchTerm.length > 0) {
    await filterStore.loadAllResults();
    router.push({ path: "/health/search" });
  }
  loading.value = false;
};

const healthRoute = computed(() => {
  if (route.value.path.includes("health")) {
    return true;
  }
  return false;
});
</script>

<style lang="sass" scoped>
.logo
  width: 100px
  margin-left: 10px
ion-icon
  font-size: 32px
  padding-right: 20px

ion-toolbar
  --border-width: 4px 0
  --min-height: 80px

.main-toolbar
  display: flex
  align-items: center
  align-content: center
  flex-wrap: wrap
  .search-bar
    width: 70%
    background-color: white
</style>
