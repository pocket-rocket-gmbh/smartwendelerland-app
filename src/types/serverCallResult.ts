export enum ResultStatus {
  SUCCESSFUL,
  FAILED
}

export class ServerCallResult {
status: ResultStatus
message: string
httpCode: number
data: any

constructor(status: ResultStatus, message: string, httpCode: number, data: any) {
  this.status = status
  this.message = message
  this.httpCode = httpCode
  this.data = data
}

static success(httpCode?: number, data?: any) {
  return new ServerCallResult(ResultStatus.SUCCESSFUL, null, httpCode, data)
}

static error(message?: string, httpCode?: number, data?: any) {
  return new ServerCallResult(ResultStatus.FAILED, message, httpCode, data)
}
}
