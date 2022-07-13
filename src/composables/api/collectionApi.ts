import { ref } from 'vue'
import { ResultStatus, ServerCallResult } from '@/types/serverCallResult'
import { RetrieveCollectionOptions } from '@/types/retrieveCollectionOptions'

export function useCollectionApi() {

  // Parameters.
  let baseApi: any = null
  let endpoint = ''

  // Results.
  const totalPages = ref(0)
  const currentPage = ref(0)
  const totalResults = ref(0)
  const items = ref([])
  const item = ref(null)

  const setBaseApi = (baseApi_: any) => {
    baseApi = baseApi_
  }

  const setEndpoint = (endpoint_: string) => {
    endpoint = endpoint_
  }

  const retrieveCollection = async (options: RetrieveCollectionOptions = { page: 1, per_page: 25, sort_by: 'created_at', sort_order: 'DESC', searchQuery: '', concat: false, filters: [] }) => {

    let search = ''

    if (options.searchQuery?.length > 0) {
      search = `&search=${options.searchQuery}`
    }

    let filtersParam = ''

    if (options.filters?.length > 0) {
      options.filters.forEach((element: any) => {
        filtersParam += '&filter_' + element.field + "=" + element.value        
      })
    }

    const result: ServerCallResult = await baseApi.call('get', `/${endpoint}?page=${options.page}&per_page=${options.per_page}&sort_by=${options.sort_by}&sort_order=${options.sort_order}${search}${filtersParam}`, null)

    if (result.status === ResultStatus.SUCCESSFUL) {
        totalPages.value = Math.ceil(result.data['total_results'] / options.per_page)
        currentPage.value = result.data['current_page']
        totalResults.value = result.data['total_results']

        if (options.concat === true) {
          items.value = items.value.concat(result.data['resources'])
        }
        else {
          items.value = result.data['resources']
        }
    }
    return result
  }

  const createItem = async (data: any) => {
    const result: ServerCallResult = await baseApi.call('post', `${endpoint}`, data)

    if (result.status === ResultStatus.SUCCESSFUL) {
      // TODO snackbar
    }
    return result
  }

  const updateItem = async (data: any) => {
    const result: ServerCallResult = await baseApi.call('put', `${endpoint}`, data)

    if (result.status === ResultStatus.SUCCESSFUL) {
      // TODO snackbar
    }
    return result
  }

  const getItem = async (id: string) => {   
    const result: ServerCallResult = await baseApi.call('get', `${endpoint}/${id}`)

    if (result.status === ResultStatus.SUCCESSFUL) {
      item.value = result.data['resource']
    }
    return result
  }

  const deleteItem = async () => {
    const result: ServerCallResult = await baseApi.call('delete', `${endpoint}`)

    if (result.status === ResultStatus.SUCCESSFUL) {
      // TODO snackbar
    }
    return result
  }

  const duplicateItem = async (data: any) => {
    const result: ServerCallResult = await baseApi.call(`${endpoint}/${data.id}/duplicate`, data)
    
    if (result.status === ResultStatus.SUCCESSFUL) {
      await getItem(data.id)
      // TODO snackbar
    }
    return result
  }

  return {
    totalPages,
    currentPage,
    totalResults,
    items,
    item,
    setBaseApi,
    setEndpoint,
    retrieveCollection,
    createItem,
    updateItem,
    getItem,
    deleteItem,
    duplicateItem
  }
}
