<template>
  <ion-button
    mode="md"
    shape="round"
    :expand="kind !== 'news' ? 'block' : ''"
    class="green-button ion-margin-top ion-margin-bottom is-tablet"
    @click="showImprint = !showImprint"
    >Impressumsangaben der Einrichtung</ion-button
  >

  <div v-auto-animate v-if="showImprint" class="general-font-size mt-3">
    <div v-if="facilityDetails?.length">
      <div v-for="(facility, index) in facilityDetails" :key="index">
        <div v-if="facility.authorized_represent_name">
          <span class="has-text-health font-weight-bold"
            >Vertretungsberechtigte Person</span
          >
          <div>{{ facility.authorized_represent_name }}</div>
        </div>

        <div
          class="divider inprint-divider"
          v-if="facility.commercial_register_number || facility.register_court"
        ></div>
        <div v-if="facility.commercial_register_number || facility.register_court">
          <span class="general-font-size is-dark-grey font-weight-bold"
            >Weitere Angaben gemäß § 5 TMG</span
          >
          <div>
            <span
              class="has-text-health font-weight-bold"
              v-if="facility.commercial_register_number"
              >Registernummer:
            </span>
            <span>{{ facility.commercial_register_number }}</span>
          </div>
          <div v-if="facility.register_court">
            <span class="has-text-health font-weight-bold">Registergericht: </span>
            <span>{{ facility.register_court }}</span>
          </div>
        </div>

        <div class="divider inprint-divider" v-if="facility.management_name"></div>

        <div v-if="facility.management_name">
          <span class="has-text-health font-weight-bold"> Geschäftsführung</span>
          <div v-for="name in facility.management_name.split(',')" :key="name">
            {{ name.trim() }}
          </div>
        </div>
        <div class="divider inprint-divider" v-if="facility.professional_title"></div>
        <div v-if="facility.professional_title">
          <div class="general-font-size is-dark-grey font-weight-bold">
            Für bestimmte Berufe
          </div>
          <span class="has-text-health font-weight-bold"
            >Gesetzliche Berufsbezeichnung</span
          >
          <div>{{ facility.professional_title }}</div>
        </div>
        <div class="divider inprint-divider" v-if="facility.awarded_in"></div>
        <div v-if="facility.awarded_in">
          <span class="has-text-health font-weight-bold"> Verliehen in</span>
          <div>{{ facility.awarded_in }}</div>
        </div>
        <div
          class="divider inprint-divider"
          v-if="facility.responsible_supervisory_authority"
        ></div>
        <div v-if="facility.responsible_supervisory_authority">
          <span class="has-text-health font-weight-bold">
            Zuständige Aufsichtsbehörde</span
          >
          <div>{{ facility.responsible_supervisory_authority }}</div>
        </div>
        <div class="divider inprint-divider" v-if="facility.associated_chamber"></div>
        <div v-if="facility.associated_chamber">
          <span class="has-text-health font-weight-bold">Zuständige Kammer</span>
          <div>{{ facility.associated_chamber }}</div>
        </div>
        <div
          class="divider inprint-divider"
          v-if="facility.professional_regulations"
        ></div>
        <div v-if="facility.professional_regulations">
          <span class="has-text-health font-weight-bold">Berufsrechtliche Regelung</span>
          <div
            v-html="transformProfessionalRegulations(facility.professional_regulations)"
          ></div>
        </div>
        <div
          class="divider inprint-divider"
          v-if="facility.tax_identification_number"
        ></div>
        <div v-if="facility.tax_identification_number">
          <span class="has-text-health font-weight-bold"
            >Umsatzsteueridentifikationsnummer</span
          >
          <div>{{ facility.tax_identification_number }}</div>
        </div>
        <div
          class="divider inprint-divider"
          v-if="facility.tax_identification_number"
        ></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, defineProps } from "vue";
const props = defineProps({
  careFacility: {
    type: Object,
    required: true,
  },
  kind: {
    type: String,
  },
});

const showImprint = ref(false);

const facilityDetails = computed(() => {
  if (!props.careFacility?.user?.care_facilities) return;
  return props.careFacility?.user?.care_facilities
    .filter((item: any) => item.kind === "facility")
    .map((item: any) => ({
      authorized_represent_name: item.authorized_represent_name,
      commercial_register_number: item.commercial_register_number,
      associated_chamber: item.associated_chamber,
      professional_title: item.professional_title,
      tax_identification_number: item.tax_identification_number,
      professional_regulations: item.professional_regulations,
      register_court: item.register_court,
      awarded_in: item.awarded_in,
      responsible_supervisory_authority: item.responsible_supervisory_authority,
      management_name: item.management_name,
    }));
});

const transformProfessionalRegulations = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  const transformedText = parts
    .map((part) => {
      if (part.match(urlRegex)) {
        return `<a href="${part}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: #58595e;">${part}</a>`;
      } else {
        return part;
      }
    })
    .join("");

  return transformedText;
};
</script>
<style lang="sass" scoped>
.inprint-divider
  margin-top: 10px
  margin-bottom: 10px

.is-tablet
  @media (min-width: 768px)
    width: 300px
</style>
