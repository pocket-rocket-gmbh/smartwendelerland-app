<template>
  <BaseLayout>
    <IntroTutorial />
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import IntroTutorial from "@/components/health/IntroTutorial.vue";
import BaseLayout from "@/components/general/BaseLayout.vue";
import { onIonViewDidEnter } from "@ionic/vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "LandingPage",
  components: { BaseLayout, IntroTutorial },
  setup() {
    const router = useRouter();

    onIonViewDidEnter(() => {
      const gesundheitsplattformTutorialSkipped = localStorage.getItem(
        "gesundheitsplattform_tutorial_skipped"
      );
      if (gesundheitsplattformTutorialSkipped) {
        if (gesundheitsplattformTutorialSkipped === "true") {
          router.push({ path: "/health/categories" });
        }
      }
    });
  },
});
</script>

<style lang="sass" scoped></style>
