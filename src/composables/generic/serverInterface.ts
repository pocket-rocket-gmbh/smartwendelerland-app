import { useUserStore } from '@/stores/user'
import { ApiCallResult } from '@/types/apiCallResult';
import axios, { AxiosRequestConfig, Method, ResponseType } from 'axios';

export function useServerInterface(authenticated = false) {

  const user = useUserStore()
  const client = axios.create()

  let isAuthenticated = authenticated

  const call = async (url: string, method: Method, data: any, responseHandler: (data: any) => void): Promise<ApiCallResult> => {
    return callBase(url, method, data, responseHandler, 'json')
  }

  const callBinary = async (url: string, method: Method, data: any, responseHandler: (data: any) => void): Promise<ApiCallResult> => {
    return callBase(url, method, data, responseHandler, 'arraybuffer')
  }

  const callBase = async (url: string, method: Method, data: any, responseHandler: (data: any) => void, type: ResponseType): Promise<ApiCallResult> => {

    let result: ApiCallResult = null

    const requestConfig: AxiosRequestConfig<any> = {
        url: url,
        method: method,
        headers: isAuthenticated ? { Authorization: `Bearer ${user.current.auth_token}` } : null,
        data: data,
        responseType: type
    }
    
    await client.request(requestConfig).then((response) => {
      if (responseHandler) {
        responseHandler(response.data)
      }
      result = ApiCallResult.success(response.status)
    }).catch((error) => {
      console.log(`server request failed: '${getErrorMessage(error)}'`)
      result = ApiCallResult.error(getErrorMessage(error), error.response?.status)
    })

    return result
  }

  const setAuthenticated = (authenticated: boolean) => {
      isAuthenticated = authenticated
  }

  const getErrorMessage = (error: any) => {
    let result: string

    if (error.response) {
      if (error.response.data && error.response.data.msg) {
        result = error.response.data.msg
      }
      else {
        result = 'UNKNOWN'
      }
      result += ` (${error.response.status})`
    }
    else if (error.code) {
      result = error.code
    }
    else {
      result = error.message
    }

    return result
  }

  return {
    call,
    callBinary,
    setAuthenticated
  };
}