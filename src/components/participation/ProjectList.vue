<template>
  <div>
    <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>
    <ion-searchbar
      class="search-bar"
      placeholder="Projekt, PLZ oder Gemeinde suchen …"
      v-model="searchQuery"
      :debounce="2000"
      @ionChange="reloadProjects()"
      @ionClear="reloadProjects()"
    />

    <div class="filters-select">

      <div @click="categoriesModalIsOpen = true">
      <div class="filter-select">
        Kategorien wählen
      </div>
    </div>

    <div @click="communitiesModalIsOpen = true">
      <div class="filter-select">
        Gemeinden wählen
      </div>
    </div>
    </div>

    <ion-modal :is-open="categoriesModalIsOpen" :can-dismiss="true">
      <ion-header mode="md">
        <ion-toolbar>
          <ion-title class="general-font-size is-dark-grey modal-title" slot="start"
            >Verfeinere hier deine Suche!</ion-title
          >

          <ion-button
            mode="md"
            slot="end"
            expand="block"
            class="blue-button"
            @click="
              categoriesModalIsOpen = false;
              debounce(reloadProjects);
            "
            >Fertig</ion-button
          >
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding-top">
        <div class="communities content-wrap">
          <div
            v-for="(category, index) in categories"
            :key="index"
            :value="category.id"
            class="filter-options"
            :model-value="selectedCategoryIds"
          >
            <label
              class="options-select-project"
              hide-details
              density="compact"
              :class="{
                'is-slected-filter': selectedCategoryIds.includes(category.id),
              }"
              @click.prevent="selectCategoryFilterValue(category)"
            >
              {{ category.name_with_projects_count }}
            </label>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <ion-modal :is-open="communitiesModalIsOpen" :can-dismiss="true">
      <ion-header mode="md">
        <ion-toolbar>
          <ion-title class="general-font-size is-dark-grey modal-title" slot="start"
            >Verfeinere hier deine Suche!</ion-title
          >
          <ion-button
            slot="end"
            mode="md"
            expand="block"
            class="blue-button"
            @click="
              communitiesModalIsOpen = false;
              debounce(reloadProjects);
            "
            >Fertig</ion-button
          >
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding-top">
        <div class="communities content-wrap">
          <div
            v-for="(community, index) in communities"
            :key="index"
            :value="community.id"
            class="filter-options"
            :model-value="selectedCommunityIds"
          >
            <label
              class="options-select-project"
              hide-details
              density="compact"
              :class="{
                'is-slected-filter': selectedCommunityIds.includes(community.id),
              }"
              @click.prevent="selectCommunityFilterValue(community)"
            >
              {{ community.name_with_projects_count }}
            </label>
          </div>
        </div>
      </ion-content>
    </ion-modal>
    <div v-if="loadingProjects" class="ion-text-center ion-padding-top">
      Es wird nach Projekten gesucht…
    </div>
    <div
      v-else-if="!loadingProjects && projects.length === 0"
      class="ion-text-center ion-padding-top"
    >
      Keine Projekte gefunden

      <div class="ion-padding">
        <PollsBox :is-public="true" />
      </div>
    </div>
    <div class="project-list" v-else>
      <div
        v-for="(project, index) in projects"
        :router-link="`projects/${project.id}`"
        :key="project.id"
      >
        <ParticipationProjectListPanel
          @click="$router.push({ path: `/participation/projects/${project.id}` })"
          :project="project"
        />

        <div class="ion-padding" v-if="index === 0">
          <PollsBox :is-public="true" />
          <PinboardBox />
        </div>
      </div>
      <ion-infinite-scroll
        v-if="currentPage < totalPages"
        @ionInfinite="loadData($event)"
      >
        <ion-infinite-scroll-content> </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </div>

    <ion-loading :is-open="loadingInProgress" message="Projekte werden geladen..." />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import {
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonLoading,
  RefresherCustomEvent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  IonModal,
} from "@ionic/vue";
import ParticipationProjectListPanel from "@/components/participation/ProjectListPanel.vue";
import { usePublicApi } from "@/composables/api/public";
import { usePrivateApi } from "@/composables/api/private";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { RetrieveCollectionOptions } from "@/types/retrieveCollectionOptions";
import PollsBox from "@/components/polls/PollsBox.vue";
import { useUser } from "@/composables/user/user";
import PinboardBox from "../pinboards/PinboardBox.vue";

export default defineComponent({
  name: "ParticipationProjectListPage",
  components: {
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    ParticipationProjectListPanel,
    IonLoading,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    PollsBox,
    IonModal,
    PinboardBox,
  },
  setup() {
    const publicApi = usePublicApi();
    const privateApi = usePrivateApi();
    const api = useCollectionApi();
    const searchQuery = ref("");
    const currentPage = ref(1);
    const totalPages = ref(1);

    const categoriesApi = useCollectionApi();
    categoriesApi.setBaseApi(usePublicApi());
    categoriesApi.setEndpoint(`categories?scope=project`);
    const categories = categoriesApi.items;
    const selectedCategoryIds = ref([]);

    const categoriesModalIsOpen = ref(false);
    const communitiesModalIsOpen = ref(false);

    const communitiesApi = useCollectionApi();
    communitiesApi.setBaseApi(usePublicApi());
    communitiesApi.setEndpoint(`communities`);
    const communities = communitiesApi.items;
    const selectedCommunityIds = ref([]);

    const projects = api.items;

    const loadingInProgress = ref(false);
    const loadingProjects = ref(false);

    onMounted(() => {
      reloadData();
    });

    const doRefresh = (event: RefresherCustomEvent) => {
      reloadData();
      event.target.complete(); // we have a separate loading indicator so we can complete the refresh indicator
    };

    const reloadData = async () => {
      currentPage.value = 1;
      Promise.all([
        getPublicProjects(false),
        getPublicCategories(),
        getPublicCommunities(),
      ]);
    };

    const reloadProjects = async () => {
      currentPage.value = 1;
      await getPublicProjects(false);
    };

    const getPublicProjects = async (concat = true) => {
      loadingInProgress.value = true;
      loadingProjects.value = true;
      const filters = [];
      if (selectedCategoryIds.value.length > 0) {
        filters.push({
          field: "category",
          value: selectedCategoryIds.value,
        });
      }

      if (selectedCommunityIds.value.length > 0) {
        filters.push({
          field: "community",
          value: selectedCommunityIds.value,
        });
      }

      const options: RetrieveCollectionOptions = {
        page: currentPage.value,
        per_page: 99,
        sort_by: "menu_order",
        sort_order: "ASC",
        searchQuery: searchQuery.value,
        concat: concat,
        filters: filters,
      };

      if (useUser().loggedIn()) {
        api.setBaseApi(privateApi);
      } else {
        api.setBaseApi(publicApi);
      }
      api.setEndpoint("projects");

      await api.retrieveCollection(options);
      totalPages.value = api.totalPages.value;
      loadingInProgress.value = false;
      loadingProjects.value = false;
    };

    const getPublicCategories = async () => {
      loadingInProgress.value = true;
      await categoriesApi.retrieveCollection({
        page: 1,
        per_page: 1000,
        sort_by: "menu_order",
        sort_order: "ASC",
        searchQuery: null,
        concat: false,
        filters: null,
      });
      loadingInProgress.value = false;
    };

    const getPublicCommunities = async () => {
      loadingInProgress.value = true;
      await communitiesApi.retrieveCollection({
        page: 1,
        per_page: 1000,
        sort_by: "menu_order",
        sort_order: "ASC",
        searchQuery: null,
        concat: false,
        filters: null,
      });
      loadingInProgress.value = false;
    };

    const loadData = (ev: InfiniteScrollCustomEvent) => {
      setTimeout(() => {
        currentPage.value += 1;
        getPublicProjects(true);
        getPublicCategories();
        getPublicCommunities();
        ev.target.complete();
      }, 300);
    };

    // The ionChange event of the ion-select element fires two times for multi item selects.
    // Adding a 10 milliseconds debounce here resolves this issue.
    function createDebounce() {
      let timeout: number = null;
      return function (fnc: any) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          fnc();
        }, 10);
      };
    }

    const selectCommunityFilterValue = (community: { id: number }) => {
      const communityId = community.id;
      const isSelected = selectedCommunityIds.value.includes(communityId);
      if (isSelected) {
        selectedCommunityIds.value = selectedCommunityIds.value.filter(
          (id) => id !== communityId
        );
      } else {
        selectedCommunityIds.value.push(communityId);
      }
    };

    const selectCategoryFilterValue = (category: { id: number }) => {
      const categoryId = category.id;
      const isSelected = selectedCategoryIds.value.includes(categoryId);
      if (isSelected) {
        selectedCategoryIds.value = selectedCategoryIds.value.filter(
          (id) => id !== categoryId
        );
      } else {
        selectedCategoryIds.value.push(categoryId);
      }
    };

    return {
      loadingInProgress,
      categoriesModalIsOpen,
      communitiesModalIsOpen,
      loadingProjects,
      doRefresh,
      projects,
      searchQuery,
      selectedCategoryIds,
      selectedCommunityIds,
      selectCommunityFilterValue,
      selectCategoryFilterValue,
      reloadProjects,
      currentPage,
      totalPages,
      loadData,
      IonModal,
      categories,
      communities,
      debounce: createDebounce(),
    };
  },
});
</script>
<style lang="sass" scoped>
.project-list
  margin-bottom: 150px

.search-bar
  margin-top: 30px

.filters-select
  display: flex
  flex-wrap: nowrap
  justify-content: space-evenly
  align-content: center
  margin: 15px 0

.filter-select
  background: #358BBC
  color: white
  display: grid
  place-items: center
  padding: 10px
  font-weight: 600
  font-size: 16px
  line-height: 22px
  text-transform: uppercase

.blue-button
  --background: #358BBC
  --color: white
  text-transform: uppercase
  margin-right: 10px

.is-slected-filter
  background: #358BBC
  color: white

ion-modal
  --width: 100%
  --height: 100%
</style>
