export interface RetrieveCollectionOptions {
  page: number,
  per_page: number,
  sort_by: string,
  sort_order: string,
  searchQuery: string,
  concat: boolean,
  filters: { field: string, value: any[] }[]
}
