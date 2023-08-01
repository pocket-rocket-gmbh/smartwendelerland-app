import axios from "axios";
import { defineStore } from "pinia";
import { ResultStatus } from "@/types/serverCallResult";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";
import { CollapsibleListItem } from "@/types/collapsibleList";

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

  basicFilters: string[];
  advancedFilters: any;
};

type FilterResponse = {
  id: string;
  name: string;
  menu_order: number;
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
  basicFilters: [],
  advancedFilters: []
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
        basicFilters: state.basicFilters,
        advancedFilters: state.advancedFilters
      };
    },
  },
  actions: {
    async getItems (filterKind: string) {
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi('health'));
      api.setEndpoint(`tag_categories`);
    
      const options = {
        page: 1,
        per_page: 999,
        sort_by: "menu_order",
        sort_order: "asc",
        searchQuery: null as any,
        concat: false,
        filters: [] as any,
      };
    
      const result = await api.retrieveCollection(options);
    
      if (result.status === ResultStatus.FAILED) {
        console.error(result);
        return;
      }
    
      const filters: any[] = result?.data?.resources?.filter((item: Facility) => filterKind === item.kind); // Filter items for current kind (event/facility/news/course) // hereeeeee!!!!
      if (!filters) {
        console.error("No filters!");
        return;
      }
    
      const serviceFilters = filters.filter((filter) => filter.filter_type === "filter_service");
    
      const tmpItemsForServiceList: CollapsibleListItem[] = [];
    
      const nextLayerWavePromisesService = serviceFilters.map((filter) =>
        this.getItemsAndNext(filter, tmpItemsForServiceList, 0)
      );
      await Promise.all([...nextLayerWavePromisesService]);
    
      this.advancedFilters = [...tmpItemsForServiceList];
    },
    async getItemsAndNext (filter: FilterResponse, arrayToAdd: CollapsibleListItem[], layer: number) {
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi('health'));
      api.setEndpoint(`tag_categories?parent_id=${filter.id}`);
      const options = {
        page: 1,
        per_page: 999,
        sort_by: "menu_order",
        sort_order: "asc",
        searchQuery: null as any,
        concat: false,
        filters: [] as any,
      };
    
      const filterItem: CollapsibleListItem = {
        id: filter.id,
        title: filter.name,
        menuOrder: filter.menu_order,
        layer,
        next: [],
      };
    
      arrayToAdd.push(filterItem);
    
      const response = await api.retrieveCollection(options);
      if (response.status === ResultStatus.FAILED) {
        console.error(response);
        throw "Api failure";
      }
      const filterItems: FilterResponse[] = response?.data?.resources;
      if (!filterItems) {
        console.error("No filterItems!");
        return false;
      }
    
      const nextLayerWave: any[] = filterItems.map((filterItemFromResponse) =>
        this.getItemsAndNext(filterItemFromResponse, filterItem.next || [], layer + 1)
      );
      return Promise.all(nextLayerWave);
    },


    async getMainFilters(filterType: FilterType, filterKind: FilterKind) {
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi('health'));
      api.setEndpoint(`tag_categories`);
    
      const response = await api.retrieveCollection();
      if (response.status === ResultStatus.FAILED) {
        throw response;
      }
    
      const filters: any[] = response?.data?.resources || [];
      const relevantFilter = filters.find(
        (filter) =>
          filter.filter_type === filterType &&
          (filterKind === "course" || filterKind === "event"
            ? filter.kind === "course" || filter.kind === "event"
            : filter.kind === filterKind)
      );
    
      if (!relevantFilter) return [];
      
      this.basicFilters = await this.getFilters(relevantFilter.id);
    },
    
    async getFilters(parentId: string) {
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi('health'));
      api.setEndpoint(`tag_categories?parent_id=${parentId}`);
    
      const relevantFilterResponse = await api.retrieveCollection({
        page: 1,
        per_page: 999,
        sort_by: "menu_order",
        sort_order: "asc",
        searchQuery: null as any,
        concat: false,
        filters: [] as any,
      });
      if (relevantFilterResponse.status === ResultStatus.FAILED) {
        throw relevantFilterResponse;
      }
      const filterItemOptions: any[] = relevantFilterResponse?.data?.resources || [];

      return filterItemOptions;
    },
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
      api.setBaseApi(usePublicApi("health"));
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

          return [bestResult.lat, bestResult.lon] as [string, string];
        } catch (err) {
          console.error(err);
          return null;
        }
      };

      if (this.currentKinds.includes("facility")) {
        const newLocationLatLongsPromises = this.allResults.map((facility) => {
          if (!facility.zip || !facility.street) {
            return null;
          }
          return getLatLngFromZipCodeAndStreet(facility.zip, facility.street);
        });

        const newLocationLatLongs = await Promise.all(newLocationLatLongsPromises);
        newLocationLatLongs.forEach((item, index) => {
          if (!item) return;
          this.allResults[index].latitude = item[0];
          this.allResults[index].longitude = item[1];
        });
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
