import { Buffer } from 'buffer'
import { Method } from 'axios'
import { useServerInterface } from '@/composables/server/interface'
import { ServerCallResult } from '@/types/serverCallResult'
import { isPlatform } from '@ionic/vue'
export function usePublicApi() {

  const username = "pocketrocket"
  const password = "84923!!ndj"
  const token = `${username}:${password}`
  const encodedToken = Buffer.from(token).toString('base64')

  const serverInterface = useServerInterface()

  serverInterface.setDomain('http://localhost:3000/v1/public')
  // serverInterface.setDomain('https://smartwendelerland-api-prod.herokuapp.com/v1/public')
  // serverInterface.setDomain('https://smartwendelerland-api-staging.herokuapp.com/v1/public')

  let platform = 'unknown'

  if (isPlatform('ios')) {
    platform = 'ios'
  } else if (isPlatform('android')) {
    platform = 'android'
  }

  serverInterface.setHeaders({
    Authorization: `Basic ${encodedToken}`,
    'Request-Source': 'app',
    'Request-Platform': platform
  })

  const call = async (method: Method, url: string, data?: any): Promise<ServerCallResult> => {
    const result = await serverInterface.call(method, url, data)
    return result
  }

  return {
    call
  }
}
