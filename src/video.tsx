import Hls, {
  HlsConfig,
  LoaderCallbacks,
  LoaderConfiguration,
  LoaderContext,
  LoadStats,
} from "hls.js";
import { FunctionComponent, JSX, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { extFetch } from "./utils";
extFetch("https://www.baidu.com/").then((res) => res.text());
// .then(console.log);
// url.replace(/^.+\/proxy\//, "")

function process(playlist: any) {
  console.log("playlist is:", playlist);
  return playlist;
}

class loader extends Hls.DefaultConfig.loader {
  constructor(config: HlsConfig) {
    console.log("ploader");
    super(config);
  }
  load(
    context: LoaderContext,
    config: LoaderConfiguration,
    callbacks: LoaderCallbacks<LoaderContext>
  ): void {
    const start = Date.now();
    extFetch(context.url.replace(/^.*\/proxy\//, ""))
      .then((res): Promise<string | ArrayBuffer> => {
        return context.responseType === "text" ? res.text() : res.arrayBuffer();
      })
      .then((res) => {
        console.log(res);
        const len = typeof res === "string" ? res.length : res.byteLength;
        callbacks.onSuccess(
          {
            url: context.url,
            data: res,
            code: 200,
          },
          {
            ...this.stats,
            aborted: false,
            loaded: len,
            retry: 0,
            total: len,
            bwEstimate: (len * 8000) / (Date.now() - start),
            // chunkCount: 0,
            // loading: {
            //   first: 0,
            //   end: 0,
            //   start: 0,
            // },
            // parsing: {
            //   start: 0,
            //   end: 0,
            // },
            // buffering: {
            //   first: 0,
            //   end: 0,
            //   start: 0,
            // },
          },
          context,
          null
        );
      });
  }
}

export function Video(
  props: JSX.IntrinsicElements["video"] & {
    control?: ReactNode;
    extra?: ReactNode;
    wrapper?: JSX.IntrinsicElements["div"];
  }
) {
  const { control, extra, wrapper, src, ...rest } = props;
  const [showExtra, setShowExtra] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = videoRef.current;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  const hlsRef = useRef<Hls>();
  const pendingRequests = useRef<string[]>([]);

  const showControler = () => {
    setShowExtra(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(setShowExtra, 3000, false);
  };

  useEffect(() => {
    if (video && src) {
      if (Hls.isSupported()) {
        console.log("hls");
        hlsRef.current?.destroy();
        const hls = (hlsRef.current = new Hls({
          debug: true,
          //   pLoader: pLoader as any,
          loader,
          enableWorker: true,
        }));
        hls.on(Hls.Events.LEVEL_LOADED, (...args) => {
          //   console.log("loaded", args);
          const details = args[1].details;
          //   console.log(details.fragments.map((f) => f.url));
          if (!video.paused) {
            setTimeout(() => {
              //   console.log("us", us);
              details.fragments.forEach((f) => {
                if (!pendingRequests.current.includes(f.url)) {
                  extFetch(f.url);
                }
              });
            }, 500);
          }
        });
        !hls.media && hls.attachMedia(video);
        hls.loadSource(src);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("video");
        video.src = src;
      }
    }
  }, [video, src]);

  useEffect(() => {
    const h = () => {
      setTimeout(() => {
        if (document.fullscreenElement) {
          screen.orientation.lock("landscape-primary").catch(() => null);
        } else {
          screen.orientation.unlock();
        }
      }, 200);
    };
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    navigator.serviceWorker?.addEventListener("message", (event) => {
      // console.log("video data", event.data);
      if (event.data.pendingRequests) {
        // console.log("video", event);
        // pendingRequests.current = event.data.pendingRequests ?? [];
        // console.log(pendingRequests.current);
      }
    });
    // console.log(chrome, caches);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="flex relative mx-auto bg-black w-full"
      onMouseMove={showControler}
      onClick={showControler}
      {...wrapper}
    >
      <div className="absolute">{showExtra ? extra : null}</div>
      <video
        ref={videoRef}
        onLoadedData={() => videoRef.current?.play().catch(() => null)}
        className="w-full"
        {...rest}
      ></video>
      {video ? (
        <div
          className={`absolute bottom-0 w-full p-4 bg-black bg-opacity-60 ${
            showExtra ? "flex" : "hidden"
          } justify-between`}
          onClick={() => setShowExtra(false)}
        >
          <button
            className={`text-white cursor-pointer text-2xl ${
              video.paused ? "i-tabler-player-play" : "i-tabler-player-pause"
            }`}
            onClick={() =>
              video.paused
                ? (video.play(), hlsRef.current?.startLoad())
                : (video.pause(), hlsRef.current?.stopLoad())
            }
          ></button>
          {control}
          <button
            className={`text-white cursor-pointer text-2xl ${
              document.fullscreenElement
                ? "i-tabler-arrows-minimize"
                : "i-tabler-arrows-maximize"
            }`}
            onClick={() =>
              document.fullscreenElement
                ? document.exitFullscreen()
                : wrapperRef.current?.requestFullscreen()
            }
          ></button>
        </div>
      ) : null}
    </div>
  );
}
