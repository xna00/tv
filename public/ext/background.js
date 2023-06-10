const responses = new Map();
const pending = new Map();
const useCacheOrFetch = async (request) => {
    var _a;
    const res = responses.get(request.url);
    const url = request.url;
    if (res) {
        console.log(url, 'cached');
        return res;
    }
    else if (pending.has(url)) {
        console.log(url, 'pending');
        return pending.get(url);
    }
    else {
        const res2 = fetch(request);
        pending.set(request.url, res2);
        const ret = await res2;
        if ((_a = ret.headers.get('content-type')) === null || _a === void 0 ? void 0 : _a.includes('video')) {
            responses.set(request.url, ret);
        }
        pending.delete(url);
        clean();
        return res2;
    }
};
const clean = () => {
    const tmp = [...responses.keys()].slice(-10);
    [...responses.keys()].forEach(key => {
        if (!tmp.includes(key)) {
            responses.delete(key);
        }
    });
};
const fetchImpl = (input, init) => {
    console.log([...responses.keys()]);
    const request = new Request(input, init);
    return useCacheOrFetch(request).then(r => r.clone());
};
const handlers = {
    getVersion: () => 1,
    fetch: (request, _) => fetchImpl(...request.params).then((res) => Promise.all([
        res.arrayBuffer(),
        {
            headers: [...res.headers],
            status: res.status,
            statusText: res.statusText,
        },
    ]))
        .then(([res, init]) => {
        return ({
            body: [...new Uint8Array(res)],
            init,
        });
    })
};
chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
    console.log(request);
    if (request.method in handlers) {
        try {
            const result = await handlers[request.method](request, sender);
            sendResponse({
                id: request.id,
                code: 0,
                result
            });
        }
        catch (error) {
            sendResponse({
                id: request.id,
                code: -1,
                error
            });
        }
    }
});
export {};
