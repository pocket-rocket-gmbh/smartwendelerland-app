import { usePrivateApi } from '@/composables/api/private'
import { ResultStatus } from '@/types/serverCallResult'
import { useUserStore } from '@/stores/user'

export function useMe() {
  const privateApi = usePrivateApi()
  const userStore = useUserStore()

  const fetchMyUser = async () => {
    const result = await privateApi.call('get', '/users/me', null)
    if (result.status === ResultStatus.SUCCESSFUL) {
      userStore.$patch({
        'user': result.data.resource
      })
      return true
    }
  }
  
  return {
    fetchMyUser
  }
}
