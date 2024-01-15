<template>
  <ion-page>
    <ion-header v-if="projekRoute && showBar">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-nav-link v-if="forceBack" :routerLink="forceBack">
            <IonIcon :icon="arrowBackOutline" />
           
          </ion-nav-link>
          <ion-back-button
            v-else
            text=""
            default-href="/"
            :icon="arrowBackOutline"
          />
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
      
      <ion-header
        class="no-border"
        mode="ios"
        v-if="view !== 'map' && !isProjectPage"
      >
        <ion-toolbar mode="md" :color="isProject ? 'pinboard' : 'health'">
          
          <ion-buttons slot="start">
            <ion-nav-link
              v-if="(forceBack && !showBar) || isCategoryPage || isProject || hasIdeas"
              :routerLink="handleForceBack"
            >
              <IonIcon class="back-button-icon" :icon="arrowBackOutline" />
            </ion-nav-link>
          </ion-buttons>
          <ion-label mode="md" >
            <div class="page-title">
              <span v-if="title" class="is-white">
                {{ title }}
              </span>
            </div>
          </ion-label>
        </ion-toolbar>
      </ion-header>

      <slot />
    </ion-content>
  </ion-page>
</template>
/* */
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
import { logInOutline, logInSharp, arrowBackOutline } from "ionicons/icons";
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
  isProject: {
    type: Boolean,
    default: false,
  },
  isProjectPage: {
    type: Boolean,
    default: false,
  },
  hasIdeas: {
    type: Boolean,
    default: false,
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
  if (!props.forceBack && props.isProject) {
    return "/participation/projects";
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

.back-button-icon {
  font-size: 12px;
  padding: 10px;
  border-radius: 50%;
  background: white;
  width: 20px;
  height: 20px;
  margin: 10px 6px 0;
  border: 1px solid #636362;
}

ion-toolbar {
  --border-style: none;
  --border-width: 0px;
  padding-bottom: 5px;
  margin-bottom: -10px;
  background: linear-gradient(
    90deg,
    #91a80d 0%,
    #bac323 46.88%,
    #9ea100 95.31%
  );
  /* background: linear-gradient(66deg, red, green, blue); */
}
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  padding: 4px 10px 0px 10px;
  line-height: 27px;
}
</style>
