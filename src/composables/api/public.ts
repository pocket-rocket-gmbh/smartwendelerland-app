import { Buffer } from 'buffer'
import { Method } from 'axios'
import { useServerInterface } from '@/composables/server/interface'
import { ServerCallResult } from '@/types/serverCallResult'
import { isPlatform } from '@ionic/vue'
import { useEnvStore } from '@/stores/env'
export function usePublicApi(scope = 'project') {
  let username = ''
  let password = ''
  if (scope === 'health') {
    username = "pocketrocket_health"
    password = "7891011"
    // password = "723bdzsng!__ffn"
  } else if (scope === 'project') {
    username = "pocketrocket"
    password = "84923!!ndj"
  }
  
  const token = `${username}:${password}`
  const encodedToken = Buffer.from(token).toString('base64')

  
  const envStore = useEnvStore()
  // let baseUrl = 'https://smartwendelerland-api-prod.herokuapp.com'
  let baseUrl = 'https://smartwendelerland-api-staging.herokuapp.com'
  // let baseUrl = 'http://localhost:3000'

  if (localStorage.getItem('smawela--env') && localStorage.getItem('smawela--env') === 'staging') {
    baseUrl = 'https://smartwendelerland-api-staging.herokuapp.com'
    envStore.$patch({
      env: 'staging'
    })
  }

  const serverInterface = useServerInterface()
  // base_url = 'http://localhost:3000'
  serverInterface.setDomain(`${baseUrl}/v1/public/`)

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
