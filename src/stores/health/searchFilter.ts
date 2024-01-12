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
  mail?: string;
  created_at?: string;
  event_dates?: [];
  excerpt?: string;
  showAllEvents?: boolean;
  tag_category_ids?: string[];
  user?: {
    name: string;
  };
};

export type Filter = {
  id: string;
  currentSearchTerm: string;
  currentTags: string[];
  currentZip: string;
  filterSort: (typeof filterSortingDirections)[number];
  loading: boolean;
  mapFilter: string;
  currentKinds: FilterKind[];

  //
  allUnalteredResults: Facility[];
  allResults: Facility[];
  filteredResults: Facility[];
  onlySearchInTitle: boolean;

  advancedFilters: any;
  mainSearch: boolean;

  allFilters: null | any[];
  allCommunities: null | any[];
  mainFilters: null | any[];
};

type FilterResponse = {
  id: string;
  name: string;
  menu_order: number;
  parent_id: string;
};

const initialFilterState: Filter = {
  id: "",
  currentSearchTerm: "",
  currentTags: [],
  currentZip: null,
  filterSort: "Aufsteigend",
  loading: false,
  mapFilter: null,
  currentKinds: [],
  mainSearch: false,

  //
  allUnalteredResults: [],
  allResults: [],
  filteredResults: [],
  onlySearchInTitle: false,
  advancedFilters: [],

  allFilters: null,
  allCommunities: null,
  mainFilters: null,
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
        mainFilters: state.mainFilters,
        advancedFilters: state.advancedFilters,
        mainSearch: state.mainSearch,
      };
    },
  },
  actions: {
    async getAllFilters() {
      if (this.allFilters) return this.allFilters;

      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint(`tag_categories?show_all=${true}`);
      const response = await api.retrieveCollection({
        page: 1,
        per_page: 999,
        sort_by: "menu_order",
        sort_order: "asc",
        searchQuery: null as any,
        concat: false,
        filters: [] as any,
      });

      if (response.status === ResultStatus.FAILED) {
        throw response;
      }

      this.allFilters = response?.data?.resources || [];

      return this.allFilters;
    },
    async getItems(filterKind: string) {
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
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
      const allFilters = await this.getAllFilters();

      const tmpItemsForServiceList: CollapsibleListItem[] = [];

      serviceFilters.forEach((filter) => this.getItemsAndNext(filter, tmpItemsForServiceList, 0, allFilters));

      this.advancedFilters = [...tmpItemsForServiceList];
    },
    async getItemsAndNext(filter: FilterResponse, arrayToAdd: CollapsibleListItem[], layer: number, allFilters: FilterResponse[]) {
      if (layer === 4) {
        return;
      }

      const filterItem: CollapsibleListItem = {
        id: filter.id,
        title: filter.name,
        menuOrder: filter.menu_order,
        layer,
        next: [],
      };

      arrayToAdd.push(filterItem);

      const childFilterItems: FilterResponse[] = allFilters.filter((item) => item.parent_id === filter.id);

      if (!childFilterItems.length) {
        return;
      }

      childFilterItems.forEach((childFilterItem) => this.getItemsAndNext(childFilterItem, filterItem.next || [], layer + 1, allFilters));
    },
    async loadAllCommunities() {
      if (this.allCommunities) return this.allCommunities;

      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint(`communities`);

      await api.retrieveCollection();

      this.allCommunities = api.items.value;

      return this.allCommunities;
    },
    async getMainFilters(filterType: FilterType, filterKind: FilterKind) {
      if (this.mainFilters) return this.mainFilters;

      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint(`tag_categories`);

      const response = await api.retrieveCollection();
      if (response.status === ResultStatus.FAILED) {
        throw response;
      }

      const filters: any[] = response?.data?.resources || [];
      const relevantFilter = filters.find((filter) => filter.filter_type === filterType && filter.kind === filterKind);

      if (!relevantFilter) return [];

      this.mainFilters = await this.getFilters(relevantFilter.id);

      return this.mainFilters as unknown as Filter[];
    },

    async getFilters(parentId: string) {
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
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
    async checkIfMultipleFacilityFiltersAreSelected() {
      if (!this.currentKinds?.length || !this.currentTags?.length) return [];

      const filterKind = this.currentKinds[0];

      const mainFilters = await this.getMainFilters("filter_facility", filterKind);
      const allFilters = await this.getAllFilters();

      const allOptions = mainFilters.map((filter) => allFilters.filter((item) => item.parent_id === filter.id));

      for (const block of allOptions) {
        const multipleOccuredInBlock = block.filter((item) => this.currentTags.includes(item.id));
        if (multipleOccuredInBlock.length > 1) {
          return multipleOccuredInBlock;
        }
      }

      return [];
    },
    async loadUnalteredAllResults() {
      const options = {
        page: 1,
        per_page: 1000,
      };

      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint(`care_facilities`);

      await api.retrieveCollection(options as any);

      this.allUnalteredResults = api.items.value;
    },
    async loadAllResults() {
      const filters = [];

      const multipleFacilityFiltersSelected = await this.checkIfMultipleFacilityFiltersAreSelected();

      const tagsToFilter = [...this.currentTags];

      if (multipleFacilityFiltersSelected.length) {
        multipleFacilityFiltersSelected.forEach((item) => {
          tagsToFilter.splice(
            tagsToFilter.findIndex((tag) => tag === item.id),
            1
          );
        });
      }

      if (tagsToFilter.length) {
        filters.push({
          field: "care_facility_tag_categories",
          value: tagsToFilter,
        });
      }

      this.allResults = this.allUnalteredResults
        .filter((result) => {
          return this.currentKinds.length ? this.currentKinds.includes(result.kind) : true;
        })
        .filter((result) => {
          return result.zip && this.currentZip ? result.zip === this.currentZip : true;
        })
        .filter((result) => {
          if (!this.currentTags.length) return true;
          return result.tag_category_ids?.find((tag) => this.currentTags.includes(tag));
        });

      this.loadFilteredResults(multipleFacilityFiltersSelected);
    },
    loadFilteredResults(filterCategories?: { id: string }[]) {
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
        })
        .filter((facility) => {
          if (!filterCategories?.length) return true;

          return filterCategories.some((category) => facility.tag_category_ids.includes(category.id));
        });

      if (this.mapFilter) {
        this.filteredResults = filteredResults.filter((facility) => facility.id === this.mapFilter);
        return;
      }

      this.filteredResults = filteredResults;
    },
  },
});
