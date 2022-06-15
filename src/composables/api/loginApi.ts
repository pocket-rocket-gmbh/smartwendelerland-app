import { useConfigStore } from '@/stores/config';
import { useUserStore } from '@/stores/user'
import { ApiCallResult, ResultStatus } from '@/types/apiCallResult'
import { useServerInterface } from '@/composables/generic/serverInterface';

export function useLoginApi() {

  const server = useServerInterface()
  const config = useConfigStore()
  const user = useUserStore()

  const performLogin = async (login: string, password: string): Promise<ApiCallResult> => { 
    const formdata = new FormData()
    formdata.append('username', login)
    formdata.append('password', password)

    server.setAuthenticated(false)

    // TODO perform actual server call
    user.setCurrent(login, null, null)

    return {
      status: ResultStatus.SUCCESSFUL,
      message: null,
      httpCode: 200
    }

    //return  server.call(config.getUrl('auth/login'), 'post', formdata, (data: any) => {
    //  user.setCurrent(login, data.access_token, data.refresh_token)
    //})
  }

  const performLogout = async (): Promise<ApiCallResult> => {

    server.setAuthenticated(true)

    // TODO perform actual server call
    user.$reset()

    return {
      status: ResultStatus.SUCCESSFUL,
      message: null,
      httpCode: 200
    }

    //return server.call(config.getUrl('auth/logout'), 'delete', null, null).finally(() => {
    //  user.$reset() // Always reset the user even if the call fails      
    //})
  }

  return {
    performLogin,
    performLogout    
  }
}
