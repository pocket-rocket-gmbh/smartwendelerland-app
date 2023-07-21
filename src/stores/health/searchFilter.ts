import axios from "axios";
import { defineStore } from "pinia";
import { ResultStatus } from "@/types/serverCallResult";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";

export const filterSortingDirections = ["Aufsteigend", "Absteigend"] as const;

export type CategoriesFilter = "category" | "subCategory" | "subSubCategory" | "tags";
export type FilterKind = "facility" | "news" | "event" | "course";
export type FilterType = "filter_facility" | "filter_service";
export type FilterTag = {
  id: string;
  menu_order: number;
  name: string;
  scope: string;
};

export type Facility = {
  id: string;
  name: string;
  description?: string;
  kind: FilterKind;
  filterType: FilterType;
  tags: FilterTag[];
  zip?: string;
  street?: string;
  latitude?: string;
  longitude?: string;
  town?: string;
  phone?: string;
  email?: string;
  url?: string;
  image_url?: string;
};

export type Filter = {
  currentSearchTerm: string;
  currentTags: string[];
  currentZip: string;
  filterSort: (typeof filterSortingDirections)[number];
  loading: boolean;
  mapFilter: string;
  currentKinds: FilterKind[];

  //
  allResults: Facility[];
  filteredResults: Facility[];
  onlySearchInTitle: boolean;
};

const initialFilterState: Filter = {
  currentSearchTerm: "",
  currentTags: [],
  currentZip: null,
  filterSort: "Aufsteigend",
  loading: false,
  mapFilter: null,
  currentKinds: [],

  //
  allResults: [],
  filteredResults: [],
  onlySearchInTitle: false,
};

export const useFilterStore = defineStore({
  id: "filter",
  state: () => initialFilterState,
  getters: {
    filterInfo: (state) => {
      return {
        currentSearchTerm: state.currentSearchTerm,
        currentZip: state.currentZip,
        currentTags: state.currentTags,
        filterSort: state.filterSort,
        currentKinds: state.currentKinds,
      };
    },
  },
  actions: {
    setFilterInfo(newFilterInfo: typeof this.filterInfo) {
      this.currentSearchTerm = newFilterInfo.currentSearchTerm;
      this.currentZip = newFilterInfo.currentZip;
      this.currentTags = newFilterInfo.currentTags;
      this.filterSort = newFilterInfo.filterSort;
      this.currentKinds = newFilterInfo.currentKinds;
    },
    getUrlQuery() {
      const filterUrl = `?filter=${JSON.stringify(this.filterInfo)}`;
      const url = `${window.location.origin}${window.location.pathname}${filterUrl}`;
      // window.history.pushState({ path: url }, "", url);
      return url;
    },
    updateFromUrlQuery() {
      const getCurrentQueryParams = (): { [key: string]: string } => {
        const params: { [key: string]: string } = {};
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        return params;
      };

      const { filter } = getCurrentQueryParams();

      if (!filter) return;

      this.setFilterInfo(JSON.parse(filter));
      const url = `${window.location.origin}${window.location.pathname}`;
      window.history.pushState({ path: url }, "", url);
    },
    async clearSearch() {
      this.currentSearchTerm = "";
      this.currentZip = null;
      this.currentTags = [];
      this.mapFilter = null;

      await this.loadAllResults();
      this.loadFilteredResults();
    },
    enableAllTags(tags: string[]) {
      this.currentTags = [...new Set([...this.currentTags, ...tags])];
    },
    disableAllTags(tags: string[]) {
      tags.forEach((tag) => {
        const index = this.currentTags.findIndex((item) => item === tag);
        if (index !== -1) this.currentTags.splice(index, 1);
      });
    },
    async loadAllResults() {
      this.loading = true;

      const filters = [];

      if (this.currentTags) {
        filters.push({ field: "care_facility_tag_categories", value: this.currentTags });
      }

      const options = {
        page: 1,
        per_page: 25,
        sort_by: "name",
        sort_order: this.filterSort == "Aufsteigend" ? "ASC" : "DESC",
        searchQuery: null as any,
        concat: false,
        filters,
      };

      const api = useCollectionApi();
      api.setBaseApi(usePublicApi('health'));
      api.setEndpoint(`care_facilities`);
      if (this.currentKinds && this.currentKinds.length) {
        api.setEndpoint(`care_facilities?kind=${this.currentKinds.join(",")}`);
      }

      await api.retrieveCollection(options as any);

      const allResultsFromApi: Facility[] = api.items.value;

      const enrichedPossibleResultsPromised = allResultsFromApi.map((result) => {
        api.setEndpoint(`care_facilities/${result.id}`);
        return api.retrieveCollection();
      });

      this.allResults = await Promise.all(enrichedPossibleResultsPromised).then((responses) => {
        return responses
          .map((response) =>
            response.status !== ResultStatus.SUCCESSFUL ? null : (response.data.resource as Facility)
          )
          .filter(Boolean);
      });

      const getLatLngFromZipCodeAndStreet = async (zipCode: string, street: string) => {
        try {
          const { data } = await axios.get(
            `https://geocode.maps.co/search?postalcode=${zipCode}&street=${street}&country=DE`
          );

          if (!data.length) {
            return null;
          }

          const bestResult = data[0];

          return [bestResult.lat, bestResult.lon];
        } catch (err) {
          console.error(err);
          return null;
        }
      };

      if (this.currentKinds.includes("facility")) {
        for (const facility of this.allResults) {
          if (facility.zip && facility.street) {
            const response = await getLatLngFromZipCodeAndStreet(facility.zip, facility.street);

            if (response) {
              const [lat, lon] = response;

              facility.latitude = lat;
              facility.longitude = lon;
            }
          }
        }
      }

      this.loading = false;

      this.loadFilteredResults();
    },
    loadFilteredResults() {
      if (this.loading || !this.allResults) return;

      const filteredResults: Facility[] = this.allResults
        .filter((result) => {
          return result.zip && this.currentZip ? result.zip === this.currentZip : true;
        })
        .filter((result) => {
          return (
            result.name.toUpperCase().includes(this.currentSearchTerm.toUpperCase()) ||
            (!this.onlySearchInTitle &&
              (result.description?.toUpperCase().includes(this.currentSearchTerm.toUpperCase()) ||
                result.tags.find((tag) => tag.name.toUpperCase().includes(this.currentSearchTerm.toUpperCase()))))
          );
        });

      if (this.mapFilter) {
        this.filteredResults = filteredResults.filter((facility) => facility.id === this.mapFilter);
        return;
      }

      this.filteredResults = filteredResults;
    },
  },
});
