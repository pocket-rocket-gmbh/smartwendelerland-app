import { defineStore } from 'pinia'
import { Order } from '@/types/order'

export type OrdersState = {
  list: Order[]
}

export const useOrdersStore = defineStore({
    id: 'orders',
    state: () => ({
      list: null
    } as OrdersState),
    getters: {
      getCount: (state) => {
        return state.list !== null ? state.list.length : 0
      },
      getList: (state) => {
        return state.list
      },
      getById: (state) => {
        return (orderId: string) => {
          if (state.list) {
            return state.list.find((order) => order.id === orderId)
          }
          else {
            return null
          }
        }
      }
    }
})
