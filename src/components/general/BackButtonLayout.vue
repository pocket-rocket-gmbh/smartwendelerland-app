<template>
  <ion-page>
    <ion-header v-if="projekRoute && showBar">
      <ion-toolbar>
        <ion-buttons slot="start" class="ion-padding">
          <ion-nav-link v-if="forceBack" :routerLink="handleGoBack">
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
      <div :class="[isCategoryPage ? 'category-page' : 'back-button']">
        <ion-nav-link
          v-if="(forceBack && !showBar) || isCategoryPage"
          :routerLink="forceBack"
        >
          <IonIcon class="back-button-icon" :icon="arrowBackOutline" />
        </ion-nav-link>
        <div
          class="page-title is-uppercase is-white "
          lang="de"
          v-if="!isFacilityPage"
        >
        <span>
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
});

const router = useRouter();
const route = router.currentRoute;

const handleGoBack = () => {
  if(props.isCategoryPage) {
    return router.options.history.go(-1);
  }
  router.push({ path: props.forceBack });
};

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
  z-index: 99;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  margin-top: 30px;
}
.back-button-icon {
  font-size: 12px;
  padding: 10px;
  border-radius: 50%;
  background: white;
  width: 20px;
  height: 20px;
  margin-top: 50%;
  margin-bottom: 15px;
  border: 1px solid #636362;
}

.page-title {
  font-size: 1.5rem;
  margin-left: 10px;
  font-weight: 600;
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
  padding: 30px 10px;
}

.not-category-page {
  margin-top: 20px;
}
</style>
