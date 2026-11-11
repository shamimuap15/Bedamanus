/** Recognise YouTube / Vimeo links so they can be embedded instead of played with <video>. */
export type VideoSource = { kind: "youtube" | "vimeo"; id: string } | { kind: "file"; src: string };

export function parseVideo(raw: string): VideoSource {
  const url = raw.trim();
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) return { kind: "youtube", id: yt[1] };
  const vm = url.match(/vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)/i);
  if (vm) return { kind: "vimeo", id: vm[1] };
  return { kind: "file", src: url };
}

export function embedUrl(v: Exclude<VideoSource, { kind: "file" }>, autoplay: boolean) {
  if (v.kind === "youtube") {
    const p = new URLSearchParams({ rel: "0", playsinline: "1", modestbranding: "1" });
    if (autoplay) { p.set("autoplay", "1"); p.set("mute", "1"); p.set("loop", "1"); p.set("playlist", v.id); }
    return `https://www.youtube-nocookie.com/embed/${v.id}?${p}`;
  }
  const p = new URLSearchParams({ dnt: "1" });
  if (autoplay) { p.set("autoplay", "1"); p.set("muted", "1"); p.set("loop", "1"); p.set("background", "0"); }
  return `https://player.vimeo.com/video/${v.id}?${p}`;
}
