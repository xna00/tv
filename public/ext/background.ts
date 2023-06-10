const responses = new Map<string, Response>()
const pending = new Map<string, Promise<Response>>()
export type Method = 'getVersion' | 'fetch';

type MakeR<M extends Method, P = undefined> = {
  readonly method: M,
  readonly params: P
}

const useCacheOrFetch = async (request: Request) => {
  const res = responses.get(request.url);
  const url = request.url
  if (res) {
    console.log(url, 'cached')
    return res;
  } else if (pending.has(url)) {
    console.log(url, 'pending')
    return pending.get(url)!
  } else {
    const res2 = fetch(request);
    pending.set(request.url, res2)
    const ret = await res2
    if (ret.headers.get('content-type')?.includes('video')) {
      responses.set(request.url, ret)
    }
    pending.delete(url)
    clean()
    return res2
  }
};

const clean = () => {
  const tmp = [...responses.keys()].slice(-10);
  [...responses.keys()].forEach(key => {
    if (!tmp.includes(key)) {
      responses.delete(key)
    }
  })
}

const fetchImpl: typeof fetch = (input, init) => {
  console.log([...responses.keys()])
  const request = new Request(input, init)
  return useCacheOrFetch(request).then(r => r.clone())
}
const handlers = {
  getVersion: () => 1,
  fetch: (request, _) => fetchImpl(...request.params).then((res) =>
    Promise.all([
      res.arrayBuffer(),
      {
        headers: [...res.headers],
        status: res.status,
        statusText: res.statusText,
      },
    ])
  )
    .then(([res, init]) => {
      return ({
        body: [...new Uint8Array(res)],
        init,
      });
    })

} satisfies { [k in Method]: (request: RequestObject & { method: k }, sender: chrome.runtime.MessageSender) => unknown }

export type ResponseObject = { [k in Method]: {
  id?: number | string,
  result: Awaited<ReturnType<(typeof handlers)[k]>>
  code: number
} }

export type RequestObject = {
  id?: string | number
} & (MakeR<'getVersion'> | MakeR<'fetch', [...Parameters<typeof fetch>]>)


chrome.runtime.onMessageExternal.addListener(
  async (request: RequestObject, sender, sendResponse) => {
    console.log(request);
    if (request.method in handlers) {
      try {
        const result = await handlers[request.method](request as any, sender)
        sendResponse({
          id: request.id,
          code: 0,
          result
        })
      } catch (error) {
        sendResponse({
          id: request.id,
          code: -1,
          error
        })
      }
    }
  }
);
