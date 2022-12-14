import errorData from '@/data/error_data'
export function useErrors() {
  const mappedErrorCode = (errorCode:string) => {
    if (errorData[errorCode]) {
      return errorData[errorCode]
    }
    return errorCode
  }

  return {
    mappedErrorCode
  }
}
