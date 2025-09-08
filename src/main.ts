import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import { IonicVue } from "@ionic/vue";

import L from "leaflet";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

import "../public/assets/sass/main.sass";

/* Theme variables */
import "./theme/variables.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* Push Notifications */
import OneSignal from "onesignal-cordova-plugin";

// Call this function when your app starts
function OneSignalInit(): void {
  // Uncomment to set OneSignal device logging to VERBOSE
  // OneSignal.Debug.setLogLevel(6);

  // NOTE: Update the initialize value below with your OneSignal AppId.
  OneSignal.initialize("07a3e29a-e951-4662-98a9-d92076e0cbb9");

  OneSignal.Notifications.addEventListener("click", (event: any) => {
    console.log("OneSignal: notification clicked:", JSON.stringify(event));
  });

  // Prompts the user for notification permissions.
  OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
    console.log("User accepted notifications: " + accepted);
  });
}

document.addEventListener("deviceready", OneSignalInit, false);

const app = createApp(App).use(createPinia()).use(IonicVue).use(router);

router.isReady().then(() => {
  app.mount("#app");
});
