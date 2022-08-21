import Hls, { HlsConfig } from "hls.js";
import { FunctionComponent, JSX, VNode } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

function process(playlist: any) {
  console.log("playlist is:", playlist);
  return playlist;
}

class pLoader extends Hls.DefaultConfig.loader {
  constructor(config: HlsConfig) {
    console.log("ploader");
    super(config);
    var load = this.load.bind(this);
    this.load = function (context, config, callbacks) {
      var onSuccess = callbacks.onSuccess;
      console.log(context, config, callbacks);
      callbacks.onSuccess = function (response, stats, context, net) {
        response.data = process(response.data);
        onSuccess(response, stats, context, net);
      };
      load(context, config, callbacks);
    };
  }
}

export function Video(
  props: JSX.IntrinsicElements["video"] & {
    control?: VNode;
    extra?: VNode;
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
  console.log("current", hlsRef.current);

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
          //   debug: true,
          //   pLoader: pLoader as any,
        }));
        hls.on(Hls.Events.LEVEL_LOADED, (...args) => {
          //   console.log("loaded", args);
          const details = args[1].details;
          //   console.log(details.fragments.map((f) => f.url));
          if (!video.paused)
            setTimeout(() => {
              caches
                .open("video")
                .then((cache) => cache.keys())
                .then((rs) => rs.map((r) => r.url))
                .then((us) => {
                  //   console.log("us", us);
                  details.fragments.forEach((f) => {
                    ![...us, ...pendingRequests.current].includes(f.url) &&
                      fetch(f.url).catch((e) => {
                        console.log(f.url, e, "fetch error");
                      });
                  });
                });
            }, 500);
        });
        !hls.media && hls.attachMedia(video);
        hls.loadSource(src);
        // hls.
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
      console.log("video data", event.data);
      if (event.data.pendingRequests) {
        console.log("video", event);
        pendingRequests.current = event.data.pendingRequests ?? [];
        console.log(pendingRequests.current);
      }
    });
    // console.log(chrome, caches);
  }, []);

  return (
    <div
      ref={wrapperRef}
      class="flex relative mx-auto bg-black w-full"
      onMouseMove={showControler}
      onClick={showControler}
      {...wrapper}
    >
      <div class="absolute">{showExtra ? extra : null}</div>
      <video
        ref={videoRef}
        onLoadedData={() => videoRef.current?.play().catch(() => null)}
        class="w-full"
        {...rest}
      ></video>
      {video ? (
        <div
          class={`absolute bottom-0 w-full p-4 ${
            showExtra ? "flex" : "hidden"
          } justify-between`}
          onClick={() => setShowExtra(false)}
        >
          <button
            class={`text-white cursor-pointer text-2xl ${
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
            class={`text-white cursor-pointer text-2xl ${
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
