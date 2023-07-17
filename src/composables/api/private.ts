import { useServerInterface } from '@/composables/server/interface'
import { Method } from 'axios'
import { ServerCallResult } from '@/types/serverCallResult'
import { useUserStore } from '@/stores/user'
import { isPlatform } from '@ionic/vue'
import { useEnvStore } from '@/stores/env'

export function usePrivateApi() {

  const AUTH_TOKEN = 'auth._token.jwt'

  const userStore = useUserStore()
  const envStore = useEnvStore()
  let baseUrl = 'https://smartwendelerland-api-prod.herokuapp.com'

  if (localStorage.getItem('smawela--env') && localStorage.getItem('smawela--env') === 'staging') {
    baseUrl = 'https://smartwendelerland-api-staging.herokuapp.com'
    envStore.$patch({
      env: 'staging'
    })
  }

  const serverInterface = useServerInterface()
  // base_url = 'http://localhost:3000'
  serverInterface.setDomain(`${baseUrl}/v1/`)

  let platform = 'unknown'

  if (isPlatform('ios')) {
    platform = 'ios'
  } else if (isPlatform('android')) {
    platform = 'android'
  }

  const call = async (method: Method, url: string, data?: any): Promise<ServerCallResult> => {
    // Reset authorization header each time to account for an auth token that is set after creation.
    serverInterface.setHeaders(
      {
        Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`,
        'Request-Source': 'app',
        'Request-Platform': platform
      }
    )

    const result = await serverInterface.call(method, url, data)

    // Unauthorized because token is probably expired -> delete it and redirect to login page.
    if (result.httpCode === 401) {
      localStorage.removeItem(AUTH_TOKEN)
      userStore.user = null
    }

    return result
  }

  return {
    call
  }
}
