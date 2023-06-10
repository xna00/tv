const fs = require("fs");
const { default: axios } = require("axios");
require("colors");

const m3uDir = "./new/";

const m3us = fs.readdirSync(m3uDir);
const data = {};

const all = m3us
  .map((f) =>
    fs
      .readFileSync(m3uDir + f, {
        encoding: "utf-8",
      })
      .matchAll(/#EXTINF:.*,(.+)\s+(.+)/g)
  )
  .flatMap((t) => {
    return Array.from(t);
  })
  .filter(([_, name, url]) => url.startsWith("http"))
  .slice(
    0
    // ,100
  );
const len = all.length;
let count = 0;
const handler = ([_, name, url] = []) => {
  return (
    url &&
    new Promise((res, rej) => {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      setTimeout(() => {
        source.cancel();
      }, 3000);
      axios({
        url,
        timeout: 3000,
        cancelToken: source.token,
      })
        .then(() => {
          res();
          console.log(`${name}, ${url} succeed`.green);

          const tmp = data[name] ?? new Set();
          tmp.add(url);
          data[name] = tmp;
        })
        .catch((e) => {
          rej(e);
          console.log(
            `${name}, ${url} failed`.red,
            e.response?.status,
            e.response?.data
          );
        });
    }).finally(() => {
      console.log(++count, len);
      return handler(all.shift());
    })
  );
};
Promise.allSettled(all.splice(0, 1000).map(handler)).then(() => {
  for (const k in data) {
    data[k] = Array.from(data[k]);
  }
  fs.writeFileSync("../public/m3u.json", JSON.stringify(data));
  console.log("data", data);
  console.log(Object.keys(data).length, Object.values(data).flat().length);
});
