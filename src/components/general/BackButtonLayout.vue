<template>
  <ion-page>
    <ion-header v-if="projekRoute && showBar">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-nav-link v-if="forceBack" :routerLink="forceBack">
            <IonIcon :icon="arrowBackOutline" />
          </ion-nav-link>
          <ion-back-button v-else text="" default-href="/" :icon="arrowBackOutline" />
        </ion-buttons>
        <ion-icon
          v-if="!useUser().loggedIn() && showLogin"
          @click="router.push('/login')"
          router-link="/login"
          :ios="logInOutline"
          :md="logInSharp"
          slot="end"
        ></ion-icon>
        <div
          v-else-if="showLogin"
          @click="router.push('/me')"
          router-link="/me"
          slot="end"
        >
          <UserProfile :user="useUser().currentUser()" />
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div
        :class="[
          isCategoryPage
            ? 'category-page'
            : (getPlatforms().some(platform => platform === 'cordova' || platform === 'ios'))
            ? 'back-button is-ios'
            : 'back-button',
            isCategoryPage && (getPlatforms().some(platform => platform === 'cordova' || platform === 'ios')) ? 'category-page-ios' : ''
        ]"
        v-if="view === 'list'"
      >
        <ion-nav-link
          v-if="(forceBack && !showBar) || isCategoryPage"
          :routerLink="handleForceBack"
        >
          <IonIcon class="back-button-icon" :icon="arrowBackOutline" />
        </ion-nav-link>
        <div class="is-uppercase is-white break-text hypernate" :class="(getPlatforms().some(platform => platform === 'cordova' || platform === 'ios')) ? 'page-title-ios' : 'page-title'" lang="de" v-if="!isFacilityPage">
          <span class="breakt-text hypernate">
            {{ title }}
          </span>
        </div>
      </div>
      <slot />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonContent,
  IonBackButton,
  IonButtons,
  IonNavLink,
  getPlatforms,
} from "@ionic/vue";
import {
  logInOutline,
  logInSharp,
  personCircleOutline,
  personCircleSharp,
  arrowBackOutline,
} from "ionicons/icons";
import { useRouter } from "vue-router";
import { useUser } from "@/composables/user/user";
import UserProfile from "@/components/UserProfile.vue";

const props = defineProps({
  forceBack: {
    type: String,
  },
  showLogin: {
    type: Boolean,
    default: true,
  },
  showBar: {
    type: Boolean,
    default: true,
  },
  isFacilityPage: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  isCategoryPage: {
    type: Boolean,
    default: false,
  },
  view: {
    type: String,
    default: "list",
  },
});

const router = useRouter();
const route = router.currentRoute;

const wasCategoryPage = computed(() => {
  if (router.currentRoute.value.query.page) {
    return true;
  }
  return false;
});

const handleForceBack = computed(() => {
  if (wasCategoryPage.value) {
    return `/health/categories/${router.currentRoute.value.query.id}`;
  }
  return props.forceBack;
});

const projekRoute = computed(() => {
  if (route.value.path.includes("participation")) {
    return true;
  }
  return false;
});
</script>

<style scoped>
.logo {
  height: 40px;
  margin-left: 10px;
}
ion-icon {
  font-size: 32px;
  padding-right: 20px;
}

.back-button {
  position: absolute;
  padding-left: 10px;
  padding-top: 10px;
  z-index: 99;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
}
.back-button-icon {
  font-size: 12px;
  padding: 10px;
  border-radius: 50%;
  background: white;
  width: 20px;
  height: 20px;
  margin-top: 10px;
  margin-bottom: 14px;
  border: 1px solid #636362;
}

.is-ios {
  margin-top: 40px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
  padding-left: 10px;
}

.page-title-ios {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
  padding-left: 10px;
}

.category-page {
  background: linear-gradient(66deg, #91a80d 0%, #bac323 46.88%, #9ea100 95.31%);
  position: absolute;
  padding-left: 10px;
  z-index: 99;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  padding: 20px 10px 10px
}

.category-page-ios {
  background: linear-gradient(66deg, #91a80d 0%, #bac323 46.88%, #9ea100 95.31%);
  position: absolute;
  padding-left: 10px;
  z-index: 99;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  padding: 50px 10px 20px 10px;
}
</style>
