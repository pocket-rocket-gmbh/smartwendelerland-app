import axios, { AxiosRequestConfig, AxiosRequestHeaders, Method } from 'axios'
import { ServerCallResult } from '@/types/serverCallResult'

export function useServerInterface() {

  const client = axios.create()

  let domain: string = null
  let headers: AxiosRequestHeaders = null

  const setDomain = (domain_: string) => {
    domain = domain_
  }

  const setHeaders = (headers_: AxiosRequestHeaders) => {
    headers = headers_
  }

  const call = async (method: Method, url: string, data?: any): Promise<ServerCallResult> => {

    const requestConfig: AxiosRequestConfig = {
      baseURL: domain,
      url: url,
      method: method,
      data: data,
      headers: headers
    }

    try {
      const response = await client.request(requestConfig)
      return ServerCallResult.success(response.status, response.data)
    }
    catch (error: any) {
      // TODO snackbar with error message
      return ServerCallResult.error(getErrorMessage(error), error.response?.status, error.response?.data)
    }
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
    setDomain,
    setHeaders,
    call
  }
}
