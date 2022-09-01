import { useRouter } from 'vue-router'
import { useServerInterface } from '@/composables/server/interface'
import { Method } from 'axios'
import { ServerCallResult } from '@/types/serverCallResult'
import { useUserStore } from '@/stores/user'

export function usePrivateApi() {

  const AUTH_TOKEN = 'auth._token.jwt'

  const router = useRouter()
  const userStore = useUserStore()

  const serverInterface = useServerInterface()
  serverInterface.setDomain('http://localhost:3000/v1/')
  // serverInterface.setDomain('https://wiiir-api-proto.herokuapp.com/v1/')
  // serverInterface.setDomain('https://wiiir-api-proto-staging.herokuapp.com/v1/')

  const call = async (method: Method, url: string, data?: any): Promise<ServerCallResult> => {

    // Reset authorization header each time to account for an auth token that is set after creation.
    serverInterface.setHeaders({ Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}` })

    const result = await serverInterface.call(method, url, data)

    // Unauthorized because token is probably expired -> delete it and redirect to login page.
    if (result.httpCode === 401) {
      localStorage.removeItem(AUTH_TOKEN)
      userStore.user = null
      router.push({ path: '/login' })
    }

    return result
  }

  return {
    call
  }
}
