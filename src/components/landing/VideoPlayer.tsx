import { embedUrl, parseVideo } from "@/lib/video";

/** Plays an MP4/WebM file, or embeds a YouTube / Vimeo link. Fills its (sized) parent. */
export function VideoPlayer({ src, poster, autoplay = false, label = "", className = "" }: { src: string; poster?: string; autoplay?: boolean; label?: string; className?: string }) {
  const v = parseVideo(src);
  if (v.kind === "file") {
    return (
      <video
        src={v.src}
        poster={poster || undefined}
        controls
        playsInline
        muted={autoplay}
        autoPlay={autoplay}
        loop={autoplay}
        preload="metadata"
        aria-label={label}
        className={`block h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <iframe
      src={embedUrl(v, autoplay)}
      title={label || "Video"}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      className={`block h-full w-full border-0 ${className}`}
    />
  );
}
