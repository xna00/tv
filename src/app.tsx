import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { InstallDialog } from "./installDialog";
import Logo from "./icon.svg";
console.log("logo", Logo);

// import "video.js/dist/video-js.css";
import { Video } from "./video";
import { Tab, Tabs } from "./tabs";

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
  const [activeKey, setActiveKey] = useState(
    (JSON.parse(localStorage.getItem(viewHistoryKey) ?? "[]") as string[])
      .length
      ? "1"
      : "2"
  );
  const [dark, setDark] = useState(false);

  useEffect(
    () => document.body.classList[dark ? "add" : "remove"]("dark"),
    [dark]
  );

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "m3u.json")
      .then((r) => r.json())
      .then((r: Channels) => {
        console.log("chans", r);
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
    <div class="h-full flex flex-col bg-#f5f5f5 dark:bg-#111 dark:text-white transition-all">
      <header
        class="px-6 py-4 lt-sm:hidden flex justify-between items-center"
        style={{
          boxShadow: dark
            ? "rgb(255 255 255 / 20%) 0px 2px 4px"
            : "0 2px 4px #00000014",
        }}
      >
        <img width={24} src={Logo} alt="" />
        <div>
          <button
            class={`w-6 h-6 dark:bg-white ${
              dark ? "i-tabler-sun" : "i-tabler-moon"
            }`}
            onClick={() => setDark(!dark)}
          ></button>
          <a href="https://github.com/xna00/tv" target="_blank">
            <button class="i-tabler-brand-github dark:bg-white w-6 h-6 ml-2"></button>
          </a>
        </div>
      </header>
      <div class="flex-1 overflow-auto flex lt-sm:flex-col sm:px-18 sm:pt-4">
        <main class="flex-grow-1 lt-sm:flex-grow-0 flex flex-col justify-start">
          <h2 class="mb-4 lt-sm:hidden">{current.name}</h2>
          <Video
            src={channels[current.name]?.[current.index]}
            extra={<h4>{current.name}</h4>}
          />
        </main>
        <aside class="overflow-auto flex-shrink-0 lt-sm:flex-shrink-1 max-w-80 lt-sm:max-w-full sm:ml-12 lt-sm:px-3">
          <Tabs
            value={activeKey}
            onChange={(v) => {
              console.log(v);
              setActiveKey(v);
            }}
          >
            <Tab key={"1"}>最近</Tab>
            <Tab key={"2"}>全部</Tab>
          </Tabs>
          {activeKey === "1" ? (
            <ol>
              {(
                JSON.parse(
                  localStorage.getItem(viewHistoryKey) ?? "[]"
                ) as string[]
              )
                .map((h) => [h, channels[h]])
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
          ) : (
            <>
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
                    return ak.localeCompare(bk);
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
            </>
          )}
        </aside>
      </div>

      <InstallDialog />
    </div>
  );
}
