export enum ResultStatus {
    SUCCESSFUL,
    FAILED
}

export class ApiCallResult {
  status: ResultStatus
  message: string
  httpCode: number

  constructor(status: ResultStatus, message: string, httpCode: number) {
    this.status = status
    this.message = message
    this.httpCode = httpCode
  }

  static success(httpCode?: number) {
    return new ApiCallResult(ResultStatus.SUCCESSFUL, null, httpCode)
  }

  static error(message?: string, httpCode?: number) {
    return new ApiCallResult(ResultStatus.FAILED, message, httpCode)
  }
}
