import { useCallback, useEffect, useRef, useState } from "preact/hooks";

// import "video.js/dist/video-js.css";
import { Video } from "./video";

type Channels = Record<string, string[]>;

const parseName = () => decodeURI(location.hash).slice(1);
const viewHistoryKey = "viewHistory";

export function App() {
  const [channels, setChannels] = useState<Channels>({});
  const [current, setCurrent] = useState({
    name: parseName(),
    index: 0,
  });
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "m3u.json")
      .then((r) => r.json())
      .then((r: Channels) => {
        Object.entries(r).forEach(([k, v]) => {
          r[k] = v.map((a) => `/proxy/${a}`);
        });
        setChannels(r);
        const handleHashChange = () => {
          const name = parseName();
          setCurrent({
            name,
            index: 0,
          });
          const tmp = (
            JSON.parse(localStorage.getItem(viewHistoryKey) ?? "[]") as string[]
          ).filter((n) => n !== name);
          tmp.unshift(name);
          localStorage.setItem(viewHistoryKey, JSON.stringify(tmp));
        };

        // handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
      });
  }, []);

  return (
    <>
      <aside class="overflow-auto flex-shrink-0 max-w-40 px-2">
        <input
          type="search"
          class="w-full"
          onChange={(e) => {
            setKeyword((e.target as HTMLInputElement).value.trim());
          }}
        />
        <ol>
          {Object.entries(channels)
            .filter(([k]) => new RegExp(keyword, "i").test(k))
            .sort(([ak], [bk]) => {
              const tmp = JSON.parse(
                localStorage.getItem(viewHistoryKey) ?? "[]"
              ) as string[];
              const a = tmp.findIndex((t) => t === ak),
                b = tmp.findIndex((t) => t === bk);

              return (
                (a === -1 ? Number.MAX_SAFE_INTEGER : a) -
                  (b === -1 ? Number.MAX_SAFE_INTEGER : b) ||
                ak.localeCompare(bk)
              );
            })
            .map(([k, v], i) => {
              return (
                <li>
                  <a href={`#${k}`} class="line-clamp-1">
                    {k}
                  </a>
                </li>
              );
            })}
        </ol>
      </aside>
      <main class="flex-grow-1 overflow-auto">
        <Video
          src={channels[current.name]?.[current.index]}
          extra={<h4>{current.name}</h4>}
        />
      </main>
    </>
  );
}
