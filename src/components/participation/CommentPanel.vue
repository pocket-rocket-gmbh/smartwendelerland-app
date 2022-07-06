<template>
  <ion-item>
    <ion-grid>
      <ion-row>
        <ion-col>
          {{ comment.user.name }}
        </ion-col>
        <ion-col style="text-align: right">
          ...
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          schrieb am {{ useDatetime().parseDatetime(comment.created_at) }}
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          {{ comment.comment }}
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonItem, IonGrid, IonRow, IonCol } from '@ionic/vue'
import { useDatetime } from '@/composables/ui/datetime'

export default defineComponent({
  name: 'ParticipationCommentPanel',
  props: {
    comment: Object
  },
  components: { IonItem, IonGrid, IonRow, IonCol },
  setup() {
    return {
      useDatetime
    }
  }
})
</script>
