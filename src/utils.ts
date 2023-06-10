import { Method, RequestObject, ResponseObject } from 'extension'

const call = <T extends RequestObject>(request: T): Promise<ResponseObject[T['method']]> => {
  return new Promise((resolve, reject) => {

    window.chrome.runtime.sendMessage(
      "pfjfdpobjbkelgmnpgfncoigidcpdnik",
      request,
      (res: ResponseObject[T['method']]) => {
        if (window.chrome.runtime.lastError) {
          reject(window.chrome.runtime.lastError)
        }
        if (res.code !== 0) {
          reject(res)
        }
        resolve(res)
      }
    );
  })
}

export const extFetch: typeof fetch = (...args) => {
  return call({ method: 'fetch', params: args }).then(({ result }) => {
    return (new Response(new Uint8Array(result.body).buffer, result.init))
  })
}
