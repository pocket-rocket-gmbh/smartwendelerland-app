import { useRouter } from 'vue-router'
import { useServerInterface } from '@/composables/server/interface'
import { Method } from 'axios'
import { ServerCallResult } from '@/types/serverCallResult'

export function usePrivateApi() {

  const AUTH_TOKEN = 'auth._token.jwt'

  const router = useRouter()

  const serverInterface = useServerInterface()
  serverInterface.setDomain('http://localhost:3000/v1/')
  serverInterface.setHeaders({ Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}` })

  const call = async (method: Method, url: string, data?: any): Promise<ServerCallResult> => {
    const result = await serverInterface.call(method, url, data)

    // Unauthorized because token is probably expired -> delete it and redirect to login page.
    if (result.httpCode === 401) {
      localStorage.removeItem(AUTH_TOKEN)
      router.push({ path: '/login' })
    }

    return result
  }

  return {
    call
  }
}
