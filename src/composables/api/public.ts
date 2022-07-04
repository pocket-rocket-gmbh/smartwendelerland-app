import { Buffer } from 'buffer'
import { Method } from 'axios'
import { useServerInterface } from '@/composables/server/interface'
import { ServerCallResult } from '@/types/serverCallResult'

export function usePublicApi() {

  const username = "pocketrocket"
  const password = "123456"
  const token = `${username}:${password}`
  const encodedToken = Buffer.from(token).toString('base64')

  const serverInterface = useServerInterface()
  serverInterface.setDomain('http://localhost:3000/v1/public/')
  serverInterface.setHeaders({
    Authorization: `Basic ${encodedToken}`
  })

  const call = async (method: Method, url: string, data?: any): Promise<ServerCallResult> => {
    const result = await serverInterface.call(method, url, data)
    return result
  }

  return {
    call
  }
}
