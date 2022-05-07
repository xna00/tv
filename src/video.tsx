import Hls from "hls.js";
import { FunctionComponent, JSX, VNode } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  const video = videoRef.current;

  const showControler = () => {
    setShowExtra(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(setShowExtra, 3000, false);
  };

  useEffect(() => {
    if (video) {
      if (!src) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("can");
        video.src = src;
      } else if (Hls.isSupported()) {
        console.log("can not");
        var hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
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

  return (
    <div
      ref={wrapperRef}
      class="flex inline-block relative w-full"
      onMouseMove={showControler}
      //   onTouchStart={showControler}
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
          class={`absolute bottom-0 w-full px-4 ${
            showExtra ? "flex" : "hidden"
          } justify-between`}
          onClick={() => setShowExtra(false)}
        >
          <button onClick={() => (video.paused ? video.play() : video.pause())}>
            {video.paused ? "▶️" : "⏸"}
          </button>
          {control}
          <button
            onClick={() =>
              document.fullscreenElement
                ? document.exitFullscreen()
                : wrapperRef.current?.requestFullscreen()
            }
          >
            {document.fullscreenElement ? "🄴" : "🄵"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
