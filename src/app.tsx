import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { InstallDialog } from "./installDialog";
import Logo from "./icon.svg";
console.log("logo", Logo);

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
    <div class="h-full flex flex-col bg-#f5f5f5">
      <header
        class="px-6 py-4 lt-sm:hidden"
        style={{ boxShadow: "0 2px 4px #00000014" }}
      >
        <img width={24} src={Logo} alt="" />
      </header>
      <div class="flex-1 overflow-auto flex lt-sm:flex-col sm:px-18 sm:pt-4">
        <main class="flex-grow-1 flex flex-col justify-start">
          <h2 class="mb-4 lt-sm:hidden">{current.name}</h2>
          <Video
            src={channels[current.name]?.[current.index]}
            extra={<h4>{current.name}</h4>}
          />
        </main>
        <aside class="overflow-auto flex-shrink-0 lt-sm:flex-shrink-1 max-w-80 lt-sm:max-w-full sm:ml-12 lt-sm:px-3">
          <input
            type="search"
            class="w-full my-2 text-base"
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
                    <a href={`#${k}`} class="line-clamp-1" title={k}>
                      {k}
                    </a>
                  </li>
                );
              })}
          </ol>
        </aside>
      </div>

      <InstallDialog />
    </div>
  );
}
