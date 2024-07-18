<template>
  <ion-modal
    :is-open="true"
    @didDismiss="emitClose"
  >
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button
            v-if="reportKind && !successFullySent"
            @click="goBack()"
          >
            <ion-icon :md="chevronBackOutline"></ion-icon
          ></ion-button>
        </ion-buttons>
        <ion-title slot="start"> {{ title }} melden</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emitClose">X</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding has-background-white">
      <div
        v-if="isFacilityAlreadyReported && !showForm && !reportKind"
        v-auto-animate
        class="ion-padding information"
      >
        Du hast bereits eine Beschwerde <i>"{{ alreadyReportedKind }}"</i> zu diesem Inhalt eingereicht
      </div>
      <div v-if="!reportKind && !successFullySent">
        <ion-row
          v-for="(option, index) in listOptions"
          :key="index"
          class="general-font-size options-select mb-2 is-clickable"
          @click="optionSelect(option)"
        >
          <ion-col class="d-flex justify-start align-center">
            <span>{{ option.text }}</span>
          </ion-col>
          <ion-row
            md="1"
            class="d-flex justify-end align-center"
          >
            <ion-icon :md="chevronForwardOutline"></ion-icon>
          </ion-row>
        </ion-row>
      </div>
      <div
        v-if="reportKind && !successFullySent"
        v-auto-animate
      >
        <div
          class="mt-2 d-flex flex-column is-dark-grey general-font-size ml-2"
          v-if="!showForm"
        >
          {{ reportKind?.description }}
        </div>
        <div class="">
          <ion-button
            mode="md"
            shape="round"
            expand="block"
            class="green-button ion-margin-top"
            @click="toogleForm"
          >
            <span v-if="showForm">Zurück<ion-icon :md="chevronUpOutline"></ion-icon></span>
            <span v-else>Weiter<ion-icon :md="chevronDownOutline"></ion-icon></span>
          </ion-button>
        </div>
        <div
          v-if="showForm"
          class="ion-margin-top"
        >
          <div class="ion-margin-bottom">
            <span class="description">Beschwerdegund</span>
            <ion-item>
              <ion-input
                :value="reportKind.text"
                :disabled="true"
              ></ion-input>
            </ion-item>
          </div>

          <div class="ion-margin-bottom">
            <span class="description">Seitentitel</span>
            <ion-item>
              <ion-input
                :value="props.title"
                :disabled="true"
              ></ion-input>
            </ion-item>
          </div>
          <div
            class="ion-margin-bottom"
            v-if="needAdditionalInformation"
          >
            <span class="description">Name (erforderlich)</span>
            <ion-item>
              <ion-input v-model="reporterName"></ion-input>
            </ion-item>
          </div>

          <div
            class="ion-margin-bottom"
            v-else
          >
            <span class="description">Name (optional)</span>
            <ion-item>
              <ion-input v-model="reporterName"></ion-input>
            </ion-item>
          </div>

          <div
            class="ion-margin-bottom"
            v-if="needAdditionalInformation"
          >
            <span class="description">E-Mail (erforderlich)</span>
            <ion-item>
              <ion-input type="email" v-model="reporterEmail"></ion-input>
            </ion-item>
            <div class="information error" v-if="!emailIsValid && showEmailError">Bitte geben Sie eine gültige E-Mail-Adresse ein.</div>
          </div>

          <div
            class="ion-margin-bottom"
            v-else
          >
            <span class="description">E-Mail (optional)</span>
            <ion-item>
              <ion-input v-model="reporterEmail"></ion-input>
            </ion-item>
            <div class="information error" v-if="!emailIsValid && showEmailError">Bitte geben Sie eine gültige E-Mail-Adresse ein.</div>
          </div>

          <div
            class="ion-margin-bottom"
            v-if="needAdditionalInformation"
          >
            <span class="description">Beschreibung (erforderlich)</span>
            <ion-item>
              <ion-textarea
                v-model="reportDescription"
                placeholder="Warum wird dieser Inhalt gemeldet?"
              ></ion-textarea>
            </ion-item>
          </div>

          <div
            class="ion-margin-bottom"
            v-else
          >
            <span class="description">Beschreibung (optional)</span>
            <ion-item>
              <ion-textarea
                v-model="reportDescription"
                placeholder="Warum wird dieser Inhalt gemeldet?"
              ></ion-textarea>
            </ion-item>
          </div>
          <div
            class="ion-margin-bottom complaint-checkbox"
            v-if="!checkboxRules"
          >
            <ion-checkbox
              label-placement="end"
              v-model="informationsAreCompleted"
              :disabled="checkboxRules"
            >
            </ion-checkbox>
            <ion-label>Meine Angaben sind vollständig.</ion-label>
          </div>
          <div
            class="ion-margin-bottom complaint-checkbox"
            v-if="!checkboxRules"
          >
            <ion-checkbox
              label-placement="end"
              v-model="privacyAccepted"
              :disabled="checkboxRules"
            ></ion-checkbox>
            <ion-label
              class="break-text checkboxes"
              lang="de"
              >Ich stimme der <a href="">Datenschutzerklärung</a> zu.
            </ion-label>
          </div>
        </div>
        <div class="complaint-actions" v-if="showForm">
          <ion-row>
            <ion-col>
              <ion-button
                mode="md"
                shape="round"
                expand="block"
                class="green-button"
                @click="sendComplaint"
                :disabled="submitRules"
              >
                <span v-if="loading">Lädt...</span>
                <span v-else>Beschwerde absenden</span>
              </ion-button>
            </ion-col>
          </ion-row>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, ref, computed, onMounted, watch } from "vue";
import { usePublicApi } from "@/composables/api/public";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { IonModal, IonHeader, IonRow, IonCol, IonIcon, IonItem, IonInput, IonTextarea, IonCheckbox, IonLabel, IonButton, onIonViewWillLeave } from "@ionic/vue";
import { chevronForwardOutline, chevronBackOutline, chevronUpOutline, chevronDownOutline } from "ionicons/icons";
import { ResultStatus } from "@/types/serverCallResult";

const emit = defineEmits(["close"]);

const reportKind = ref(null);
const successFullySent = ref(false);
const alreadyReportedKind = ref(null);
const alreadyReportedFacilityId = ref(null);
const showForm = ref(false);
const reportedUrl = ref("");
const reportDescription = ref("");
const reporterName = ref("");
const reporterEmail = ref("");
const privacyAccepted = ref(false);
const informationsAreCompleted = ref(false);
const loading = ref(false);
const emailIsValid = ref(false);
const showEmailError = ref(false);

const props = defineProps<{
  title: string;
  kind: string;
  facilityId: string;
  userId?: string;
}>();

const emitClose = () => {
  emit("close");
};

const listOptions = ref([
  {
    text: "Verstoß gegen geltendes Recht",
    description:
      "Ein Verstoß gegen geltendes Recht liegt vor, wenn eine Handlung oder ein Unterlassen gegen bestehende gesetzliche Bestimmungen verstößt. Dies kann in verschiedenen Rechtsbereichen geschehen: Im Strafrecht handelt es sich um Delikte wie Diebstahl, Betrug oder Körperverletzung. Im Zivilrecht betrifft es Vertragsverletzungen oder unerlaubte Handlungen. Im Verwaltungsrecht sind es Verstöße gegen Bauvorschriften oder Umweltauflagen. Im Arbeitsrecht umfassen sie Verstöße gegen das Arbeitszeitgesetz oder das Mindestlohngesetz. Konsequenzen können Geldbußen, Schadensersatz, Freiheitsstrafen oder administrative Maßnahmen sein. Ein Beispiel ist ein Unternehmen, das gegen Umweltauflagen verstößt, indem es gefährliche Abfälle unsachgemäß entsorgt.",
    value: 0,
  },
  {
    text: "Belästigung",
    description:
      "Belästigung bezeichnet ein Verhalten, das eine Person in unangemessener Weise bedrängt, stört oder erniedrigt. Dies kann verbal, physisch oder psychisch geschehen und zielt darauf ab, das Opfer zu verunsichern oder zu verletzen. Im beruflichen Umfeld umfasst Belästigung oft sexuelle Anspielungen, unerwünschte Berührungen oder anstößige Kommentare. Auch im öffentlichen Raum kann Belästigung auftreten, beispielsweise durch aufdringliche Ansprachen oder Drohungen. Die Konsequenzen von Belästigung reichen von Abmahnungen und Geldstrafen bis hin zu gerichtlichen Verfahren. Ein Beispiel ist ein Mitarbeiter, der eine Kollegin wiederholt mit unangemessenen Bemerkungen bedrängt.",
    value: 1,
  },
  {
    text: "Spam",
    description:
      "Spam bezeichnet unerwünschte und massenhaft versendete Nachrichten, die oft Werbung oder betrügerische Inhalte enthalten. Diese Nachrichten werden ohne Zustimmung des Empfängers verschickt und können per E-Mail, SMS oder über soziale Netzwerke verbreitet werden. Spam kann nicht nur lästig sein, sondern auch Sicherheitsrisiken bergen, da er oft Links zu schädlichen Websites oder Anhänge mit Malware enthält. Die Konsequenzen von Spam können von der Blockierung des Absenders bis hin zu rechtlichen Maßnahmen wie Geldstrafen reichen. Ein Beispiel ist das massenhafte Versenden von Werbe-E-Mails für fragwürdige Produkte an eine große Anzahl von Empfängern ohne deren Einwilligung.",
    value: 2,
  },
  {
    text: "Verstoß gegen die Nutzungsbedingungen",
    description:
      "Ein Verstoß gegen die Nutzungsbedingungen liegt vor, wenn eine Person die festgelegten Regeln und Richtlinien eines Dienstes oder einer Plattform missachtet. Dies kann verschiedene Formen annehmen, wie z.B. das Veröffentlichen unangemessener Inhalte, das Betreiben illegaler Aktivitäten oder das Missbrauchen von Diensten für Spam oder Betrug. Die Nutzungsbedingungen dienen dazu, ein sicheres und respektvolles Umfeld zu gewährleisten. Konsequenzen eines solchen Verstoßes können die Sperrung des Nutzerkontos, der Entzug von Zugangsrechten oder rechtliche Schritte sein. Ein Beispiel ist ein Nutzer, der auf einer Social-Media-Plattform wiederholt Hassreden postet, obwohl dies ausdrücklich verboten ist.",
    value: 3,
  },
  {
    text: "Andere",
    description:
      "Der Begriff 'Andere' bezeichnet Handlungen oder Verhaltensweisen, die nicht in die spezifischen Kategorien der geltenden Regelungen oder typischen Verstöße passen. Diese Kategorie dient als Sammelbegriff für diverse und nicht näher definierte Verstöße, die dennoch gegen bestimmte Richtlinien oder Normen verstoßen. Die Konsequenzen solcher Verstöße können je nach Schwere und Kontext variieren und reichen von milden Verwarnungen bis hin zu strengeren Sanktionen. Ein Beispiel ist das Missachten einer internen Richtlinie eines Unternehmens, die nicht ausdrücklich in den Hauptkategorien der Verhaltensregeln aufgeführt ist.",
    value: 4,
  },
]);

const optionSelect = (option: any) => {
  reportKind.value = option;
};

const isFacilityAlreadyReported = computed(() => {
  if (alreadyReportedFacilityId.value === props.facilityId) {
    return true;
  } else {
    return false;
  }
});

const getCurrentUrl = () => {
  reportedUrl.value = window.location.href;
};

const goBack = () => {
  reportKind.value = null;
  reportDescription.value = "";
  reporterEmail.value = "";
  reporterName.value = "";
  informationsAreCompleted.value = false;
  privacyAccepted.value = false;
  showForm.value = false;
};

const toogleForm = () => {
  showForm.value = !showForm.value;
  cleanForm();
};

watch (reporterEmail, (newVal) => {
  showEmailError.value = true;
  if (validateEmail(newVal)) {
    emailIsValid.value = true;
    showEmailError.value = false;
  } else {
    emailIsValid.value = false;
  }
});


const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

const cleanForm = () => {
  reportDescription.value = "";
  reporterEmail.value = "";
  reporterName.value = "";
  informationsAreCompleted.value = false;
  privacyAccepted.value = false;
  showEmailError.value = false;
};

const needAdditionalInformation = computed(() => {
  if (reportKind.value.value === 0) {
    return false;
  } else {
    return true;
  }
});

const checkboxRules = computed(() => {
  if (!needAdditionalInformation.value) {
    return !(reportDescription.value.length || reporterEmail.value.length || reporterName.value.length);
  } else {
    return false;
  }
});

const createUpdateApi = useCollectionApi();
createUpdateApi.setBaseApi(usePublicApi("health"));

const sendComplaint = async () => {
  createUpdateApi.setEndpoint("complaints");
  try {
    loading.value = true;
    const data = {
      page_title: props.title,
      reporter_name: reporterName.value,
      reporter_email: reporterEmail.value,
      reason: reportDescription.value,
      url: reportedUrl.value,
      kind: reportKind.value.value,
      last_action: "unchanged",
      action: "unchanged",
      meta_data: {
        facility_id: props.facilityId,
        kind: props.kind,
        user_id: props.userId,
        plattform: "app"
      },
    };
    const result = await createUpdateApi.createItem(data, "Beschwerde erfolgreich gesendet");
    if (result.status === ResultStatus.SUCCESSFUL) {
      successFullySent.value = true;
      loading.value = false;
      emitClose();
      setAlreadyReported();
    }
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
};

const setAlreadyReported = () => {
  localStorage.setItem("alreadyReported", JSON.stringify([reportKind.value.text, props.facilityId]));
};


const getAlreadyReported = () => {
  const alreadyReported = localStorage.getItem("alreadyReported");
  if (alreadyReported) {
    alreadyReportedKind.value = JSON.parse(alreadyReported)[0];
    alreadyReportedFacilityId.value = JSON.parse(alreadyReported)[1];
  }
};

const submitRules = computed(() => {
  if (needAdditionalInformation.value) {
    if (
      !reportKind.value ||
      !reportedUrl.value ||
      !reporterName.value ||
      !reportDescription.value ||
      !informationsAreCompleted.value ||
      !privacyAccepted.value ||
      !emailIsValid.value
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    const hasReportDetails =
      (reportDescription.value.length > 0 ||
      reporterEmail.value.length > 0 ||
      reporterName.value.length > 0) && !emailIsValid.value;

    const isInformationIncomplete = !(
      informationsAreCompleted.value && privacyAccepted.value
    );

    if (hasReportDetails && isInformationIncomplete) {
      return true;
    }
  }

  return false;
});

onMounted(async () => {
  getCurrentUrl();
  getAlreadyReported();
});
</script>
<style lang="sass" scoped>

.options-select
  border: 1px solid grey
  gap: 10px

.description
 padding: 15px

.complaint-checkbox
    display: flex
    gap: 20px
    align-items: center
    margin-top: 40px


ion-checkbox
  --size: 32px
  --padding: 5px
  --checkbox-background-checked: var(--ion-color-health)


ion-checkbox::part(container)
  border-radius: 6px
  border: 2px solid var(--ion-color-health)
  background-color: var(--ion-color-health)

.complaint-actions
  text-transform: uppercase
  color: white
  height: 72px
  width: 100%
  display: grid
  place-items: center

  bottom: 0
  margin-bottom: 60px
</style>
