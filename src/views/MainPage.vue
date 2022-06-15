<template>
  <ion-page>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-list>

            <ion-list-header>Wiiir</ion-list-header>

            <menu-item               
              label="Übersicht"
              link="overview"
              :iconIos="informationOutline"
              :iconMd="informationSharp"
            />

            <menu-item               
              label="Liste Beispiel"
              link="list"
              :iconIos="listOutline"
              :iconMd="listSharp"
            />

            <menu-item               
              label="PDF Download Beispiel"
              link="pdfdownload"
              :iconIos="cloudDownloadOutline"
              :iconMd="cloudDownloadSharp"
            />

            <menu-item               
              label="Upload Beispiel"
              link="upload"
              :iconIos="cloudUploadOutline"
              :iconMd="cloudUploadSharp"
            />

            <menu-item               
              label="Fabric Beispiel"
              link="fabric"
              :iconIos="imageOutline"
              :iconMd="imageSharp"
            />

            <ion-item-divider />

            <menu-item
              label="Logout"              
              :iconIos="logOutOutline"
              :iconMd="logOutSharp"
              @click="performLogout"
            />

            <ion-item-divider />

            <menu-item
              label="Info"
              link="/main/info"              
              :iconIos="helpCircleOutline"
              :iconMd="helpCircleSharp"
            />

          </ion-list>

        </ion-content>
      </ion-menu>

      <ion-router-outlet id="main-content"></ion-router-outlet>

      <ion-loading
        :is-open="logoutInProgress"
        message="Abmelden..."
      />            

    </ion-split-pane>
  </ion-page>

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonItemDivider, IonRouterOutlet, IonLoading } from '@ionic/vue'
import { informationOutline, informationSharp, listOutline, listSharp, cloudDownloadOutline, cloudDownloadSharp, cloudUploadOutline, cloudUploadSharp, imageOutline, imageSharp, logOutOutline, logOutSharp, helpCircleOutline, helpCircleSharp } from 'ionicons/icons'
import MenuItem from '@/components/MenuItem.vue'
import { useLoginApi } from '@/composables/api/loginApi'

export default defineComponent({
  name: 'MainPage',
  components: { IonPage, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonItemDivider, MenuItem, IonRouterOutlet, IonLoading },
  setup() {

    const router = useRouter()
    const loginApi = useLoginApi()

    const logoutInProgress = ref(false)

    const performLogout = () => {

      logoutInProgress.value = true

      loginApi.performLogout().then(() => {
        logoutInProgress.value = false        
        router.push('/login') // Disregard the actual result and go to the login page anyway (even in case of errors)
      })
    }

    return { 
      logoutInProgress,
      performLogout,
      informationOutline,
      informationSharp,
      listOutline,
      listSharp,
      cloudDownloadOutline,
      cloudDownloadSharp,
      cloudUploadOutline,
      cloudUploadSharp,
      imageOutline,
      imageSharp,
      logOutOutline,
      logOutSharp,
      helpCircleOutline,
      helpCircleSharp
    }
  }
})
</script>

<!-- Styles taken from Ionic side menu example project -->
<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
  font-size: 16px;

  margin-bottom: 18px;

  color: #757575;

  min-height: 26px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
  margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>