import { useConfigStore } from '@/stores/config';
import { useOrdersStore } from '@/stores/server-cache/orders'
import { Order } from '@/types/order'
import { ApiCallResult, ResultStatus } from '@/types/apiCallResult';
import { useServerInterface } from '@/composables/generic/serverInterface';

export function useOrdersApi() {

  const server = useServerInterface(true)
  const config = useConfigStore()
  const orders = useOrdersStore()

  const loadOrders = async (): Promise<ApiCallResult> => {

    // TODO perform actual server call
    orders.list = convertServerRespose([
      {
        auftrag_nr: 1337,
        auftrag_name: "Auftrag 1"
      },
      {
        auftrag_nr: 42,
        auftrag_name: "Auftrag 2"
      },
      {
        auftrag_nr: 4711,
        auftrag_name: "Auftrag 3"
      }
    ])

    return {
      status: ResultStatus.SUCCESSFUL,
      message: null,
      httpCode: 200
    }

    //return server.call(config.getUrl('auftraege'), 'get', null, (data: any) => {
    //  orders.list = convertServerRespose(data)
    //})    
  };

  const unloadOrders = () => {
    orders.$reset()
  }

  const convertServerRespose = (data: any[]): Order[] => {

    const result: Order[] = []

    data.forEach((element) => {    
      result.push(convertServerOrder(element))
    })

    return result
  }

  const convertServerOrder = (data: any): Order => {
    return {
      id:   data.auftrag_nr,
      name: data.auftrag_name
    }
  }

  return {
    loadOrders,
    unloadOrders
  }
}