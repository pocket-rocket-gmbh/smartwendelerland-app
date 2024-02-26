import { defineStore } from "pinia";
import { ResultStatus } from "@/types/serverCallResult";
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";
import { CollapsibleListItem } from "@/types/collapsibleList";
import {
  getAllFilters,
  getFilters,
  getMainFilters,
} from "@/utils/filter.utils";

export const filterSortingDirections = ["Aufsteigend", "Absteigend"] as const;

export type CategoriesFilter =
  | "category"
  | "subCategory"
  | "subSubCategory"
  | "tags";
export type FilterKind = "facility" | "news" | "event" | "course";
export type FilterType = "filter_facility" | "filter_service";
type FilterResponse = {
  id: string;
  name: string;
  menu_order: number;
  parent_id: string;
  care_facilities_count: string;
};
export type FilterTag = {
  id: string;
  menu_order: number;
  name: string;
  scope: string;
};
export type User = {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  role: string;
  register_token?: string;
};

export type Facility = {
  [x: string]: any;
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
  url_kind?: "internal" | "external";
  image_url?: string;
  created_at: Date;
  user: User;
  user_care_facility_name: string;
  logo?: string;
  logo_url?: string;
  community_id?: string;
  tag_category_ids?: string[];
  user_care_facility?: Facility;
};

type FilterOption = {
  parentId: string;
  options: {
    id: string;
    name: string;
    care_facilities_active_count: number;
  }[];
};

export type MainFilter = {
  id: string;
  name: string;
  options: {
    id: string;
    name: string;
    care_facilities_active_count: number;
  }[];
};

export type Filter = {
  currentSearchTerm: string;
  allFacilityMainFilters: MainFilter[];
  allServiceTags: any[];

  filteredFacilityMainFilters: MainFilter[];
  currentFacilityTags: any[];
  currentServiceTags: any[];
  currentZips: string[];
  filterSort: (typeof filterSortingDirections)[number];
  loading: boolean;
  mapFilter: string;
  currentKinds: FilterKind[];
  allCategories: any[];
  filteredCategories: any[];

  //
  allUnalteredResults: Facility[];
  allResults: Facility[];
  filteredResults: Facility[];
  onlySearchInTitle: boolean;

  allFilters: null | any[];
  allCommunities: null | any[];
  filteredCommunities: null | any[];
  mainFilters: null | any[];

  mainSearch: boolean;
};

const initialFilterState: Filter = {
  currentSearchTerm: "",

  allFacilityMainFilters: [],
  allServiceTags: [],

  filteredFacilityMainFilters: [],
  currentFacilityTags: [],
  currentServiceTags: [],
  currentZips: [],
  filterSort: "Aufsteigend",
  loading: false,
  mapFilter: null,
  currentKinds: [],
  allCategories: [],
  filteredCategories: [],
  mainSearch: false,

  //
  allUnalteredResults: [],
  allResults: [],
  filteredResults: [],
  onlySearchInTitle: false,

  allFilters: null,
  allCommunities: null,
  filteredCommunities: null,
  mainFilters: null,
};

export const useFilterStore = defineStore({
  id: "filter",
  state: () => initialFilterState,
  getters: {
    filterInfo: (state) => {
      return {
        currentSearchTerm: state.currentSearchTerm,
        currentZips: state.currentZips,
        currentFacilityTags: state.currentFacilityTags,
        currentServiceTags: state.currentServiceTags,
        filterSort: state.filterSort,
        currentKinds: state.currentKinds,
        mainSearch: state.mainSearch,
      };
    },
  },
  actions: {
    setFilterInfo(newFilterInfo: typeof this.filterInfo) {
      this.currentSearchTerm = newFilterInfo.currentSearchTerm;
      this.currentZips = newFilterInfo.currentZips;
      this.currentFacilityTags = newFilterInfo.currentFacilityTags;
      this.currentServiceTags = newFilterInfo.currentServiceTags;
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
      // const url = `${window.location.origin}${window.location.pathname}`;
      // window.history.pushState({ path: url }, "", url);
    },
    async clearSearch() {
      this.currentSearchTerm = "";
      this.currentZips = [];
      this.currentFacilityTags = [];
      this.currentServiceTags = [];
      this.mapFilter = null;

      this.loadAllResults();
    },
    async clearTermSearch() {
      this.currentSearchTerm = "";
      this.loadAllResults();
    },
    // enableAllTags(tags: string[]) {
    //   this.currentTags = [...new Set([...this.currentTags, ...tags])];
    // },
    // disableAllTags(tags: string[]) {
    //   tags.forEach((tag) => {
    //     const index = this.currentTags.findIndex((item) => item === tag);
    //     if (index !== -1) this.currentTags.splice(index, 1);
    //   });
    // },
    async loadAllCommunities() {
      if (this.allCommunities) return this.allCommunities;
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint(`communities`);

      await api.retrieveCollection();

      this.allCommunities = api.items.value.filter(
        (community) => community.care_facilities_active_count > 0
      );

      console.log(this.allCommunities);
      return this.allCommunities;
    },
    async loadAllFilters() {
      if (this.allFilters) return this.allFilters;

      this.allFilters = await getAllFilters();

      return this.allFilters;
    },
    async loadAllFacilityFilters() {
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint(`tag_categories`);
      const options = {
        page: 1,
        per_page: 1000,
        sort_by: "menu_order",
        sort_order: "ASC",
      };

      const response = await api.retrieveCollection(options as any);
      if (response.status === ResultStatus.FAILED) {
        console.log("failed");
        throw response;
      }

      const filters: any[] = response?.data?.resources || [];

      console.log(filters, "start");
      const relevantFilter = filters.find(
        (filter) =>
          filter.filter_type === "filter_facility" &&
          filter.kind === this.currentKinds[0]
      );

      if (!relevantFilter) return [];

      this.allFacilityMainFilters = await getFilters(relevantFilter.id);

      const allFilters = await this.loadAllFilters();
      const allOptions = this.allFacilityMainFilters.map((filter: any) =>
        allFilters.filter((item: any) => item.parent_id === filter.id)
      );

      const filterOptions: FilterOption[] = [];
      allOptions.forEach((options: any, index: any) => {
        const filteredOptions = options.filter((option: any) => {
          return this.allUnalteredResults.find((filteredResult: any) => {
            return filteredResult.tag_category_ids.find(
              (tagCategoryId: any) => tagCategoryId === option.id
            );
          });
        });

        if (!filteredOptions.length) {
          return;
        }

        filterOptions.push({
          parentId: this.allFacilityMainFilters[index].id,
          options: filteredOptions,
        });
      });

      this.allFacilityMainFilters.forEach((mainFilter) => {
        mainFilter.options =
          filterOptions.find(
            (filterOption) => filterOption.parentId === mainFilter.id
          )?.options || [];
      });

      this.allFacilityMainFilters = this.allFacilityMainFilters.filter(
        (mainFilter) => mainFilter.options.length
      );

      return this.allFacilityMainFilters;
    },
    async loadAllServiceFilters() {
      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint("tag_categories");
      const options = {
        page: 1,
        per_page: 1000,
        sort_by: "menu_order",
        sort_order: "ASC",
      };

      const result = await api.retrieveCollection(options as any);

      if (result.status === ResultStatus.FAILED) {
        console.error(result);
        return;
      }

      const filters: any[] = result?.data?.resources?.filter(
        (item: Facility) => this.currentKinds.length ? this.currentKinds[0] === item.kind : true
      );

      console.log(filters, "start, norman", this.currentKinds);

      if (!filters) {
        console.error("No filters!");
        return;
      }

      const serviceFilters = filters.filter(
        (filter) => filter.filter_type === "filter_service"
      );
      const allFilters = await this.loadAllFilters();

      const getItemsAndNext = (
        filter: FilterResponse,
        arrayToAdd: CollapsibleListItem[],
        layer: number,
        allFilters: FilterResponse[]
      ) => {
        if (layer === 4) {
          return;
        }

        const filterItem: CollapsibleListItem = {
          id: filter.id,
          title: filter.name,
          menuOrder: filter.menu_order,
          layer,
          next: [],
          care_facilities_count: filter.care_facilities_count,
        };

        arrayToAdd.push(filterItem);

        const childFilterItems: FilterResponse[] = allFilters.filter(
          (item) => item.parent_id === filter.id
        );

        if (!childFilterItems.length) {
          return;
        }

        childFilterItems.forEach((childFilterItem) =>
          getItemsAndNext(
            childFilterItem,
            filterItem.next || [],
            layer + 1,
            allFilters
          )
        );
      };

      const tmpItemsForServiceList: CollapsibleListItem[] = [];

      serviceFilters.forEach((filter) =>
        getItemsAndNext(filter, tmpItemsForServiceList, 0, allFilters)
      );

      this.allServiceTags = tmpItemsForServiceList;

      return this.allServiceTags;
    },
    async loadMainFilters(filterKind: FilterKind) {
      if (this.mainFilters) return this.mainFilters;

      this.mainFilters = await getMainFilters("filter_facility", filterKind);

      return this.mainFilters;
    },
    async checkIfMultipleFacilityFiltersAreSelected() {
      if (!this.currentKinds?.length || !this.currentFacilityTags?.length)
        return [];

      const filterKind = this.currentKinds[0];

      const mainFilters = await this.loadMainFilters(filterKind);
      const allFilters = await this.loadAllFilters();

      const allOptions = mainFilters.map((filter) =>
        allFilters.filter((item) => item.parent_id === filter.id)
      );

      const relevantItems = [];
      for (const block of allOptions) {
        const multipleOccuredInBlock = block.filter((item) =>
          this.currentFacilityTags.includes(item.id)
        );

        if (multipleOccuredInBlock.length) {
          relevantItems.push(multipleOccuredInBlock);
        }
      }

      return relevantItems.flat();
    },
    async loadUnalteredAllResults() {
      const options = {
        page: 1,
        per_page: 1000,
        sort_by: "menu_order",
        sort_order: "ASC",
      };

      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint(`care_facilities`);

      await api.retrieveCollection(options as any);

      this.allUnalteredResults = api.items.value;
    },
    async loadAllCategories() {
      const options = {
        page: 1,
        per_page: 1000,
        sort_by: "menu_order",
        sort_order: "ASC",
      };

      const api = useCollectionApi();
      api.setBaseApi(usePublicApi("health"));
      api.setEndpoint(`categories`);

      await api.retrieveCollection(options as any);

      this.allCategories = api.items.value
        .map((item) => {
          return item.sub_sub_categories;
        })
        .flat();
    },
    loadFilteredCategories() {
      if (!this.allCategories.length) return;
      this.filteredCategories = this.allCategories.filter((result) => {
        return (
          result.name
            .toUpperCase()
            .includes(this.currentSearchTerm.toUpperCase()) ||
          result.description
            ?.toUpperCase()
            .includes(this.currentSearchTerm.toUpperCase())
        );
      });
    },
    loadFilteredCommunities() {
      if (!this.allCommunities?.length) return;
      this.filteredCommunities = this.allCommunities
        .filter((community) => community.care_facilities_active_count > 0)
        .filter((community) => {
          if (!this.filteredResults?.length) return true;

          return this.filteredResults.find(
            (result) =>
              result.community_id === community.id ||
              this.currentZips.includes(result.zip)
          );
        });
      return this.filteredCommunities;
    },
    loadFilteredFacilityMainFilters() {
      if (!this.allFacilityMainFilters.length) return;

      this.filteredFacilityMainFilters = this.allFacilityMainFilters.filter(
        (mainFilter) => {
          if (!this.filteredResults?.length) return true;

          return this.filteredResults.find((result) =>
            result.tag_category_ids.some((tagCategoryId) =>
              mainFilter.options.find((option) => option.id === tagCategoryId)
            )
          );
        }
      );
      return this.filteredFacilityMainFilters;
    },
    async loadAllResults() {
      if (!this.allUnalteredResults.length) {
        return;
      }
      this.allResults = this.allUnalteredResults
        .filter((result) => {
          if (!this.currentKinds.length) return true;
          return this.currentKinds.includes(result.kind);
        })
        .filter((result) => {
          if (!this.currentSearchTerm) return true;

          return (
            result.name
              .toUpperCase()
              .includes(this.currentSearchTerm.toUpperCase()) ||
            (!this.onlySearchInTitle &&
              (result.description
                ?.toUpperCase()
                .includes(this.currentSearchTerm.toUpperCase()) ||
                result.tags.find((tag) =>
                  tag.name
                    .toUpperCase()
                    .includes(this.currentSearchTerm.toUpperCase())
                )))
          );
        })
        .filter((result) => {
          if (!this.currentZips?.length) return true;
          return this.currentZips.includes(result?.zip);
        })
        .filter((result) => {
          if (!this.currentFacilityTags.length) return true;

          return this.currentFacilityTags.some((facilityTag) => {
            return result.tag_category_ids.includes(facilityTag);
          });
        })
        .filter((facility) => {
          if (!this.currentServiceTags?.length) return true;

          return this.currentServiceTags.every((serviceTag) => {
            return facility.tag_category_ids.includes(serviceTag);
          });
        });

      if (this.mapFilter) {
        this.filteredResults = this.allResults.filter(
          (facility) => facility.id === this.mapFilter
        );
        return;
      }

      this.filteredResults = this.allResults;
    },
    resetAllFilters() {
      this.currentSearchTerm = "";
      this.allFacilityMainFilters = [];
      this.currentFacilityTags = [];
      this.filteredFacilityMainFilters = [];
      this.currentServiceTags = [];
      this.currentZips = [];
      this.loading = false;
      this.mapFilter = null;
      this.currentKinds = [];
      this.allResults = [];
      this.filteredResults = [];
      this.onlySearchInTitle = false;
      this.mainFilters = null;
      this.filteredCategories = [];
    },
  },
});
