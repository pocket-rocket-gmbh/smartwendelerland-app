import { useConfigStore } from '@/stores/config';
import { ApiCallResult, ResultStatus } from '@/types/apiCallResult';
import { useServerInterface } from '@/composables/generic/serverInterface';

export function useUploadApi() {

  const server = useServerInterface(true)
  const config = useConfigStore()

  const upload = async (file:File): Promise<ApiCallResult> => {
    const formdata = new FormData()
    formdata.append('file', file, file.name)

    // TODO perform actual server call

    return {
      status: ResultStatus.SUCCESSFUL,
      message: null,
      httpCode: 200
    }

    //return server.call(config.getUrl('auftraege/' + orderId + '/tz/' + id + '/upload'), 'put', formdata, null)
  }

  return {
    upload
  }
}