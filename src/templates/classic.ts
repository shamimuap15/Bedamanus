import type { Template } from "./types";

export const classic: Template = {
  key: "classic",
  label: "Classic dark",
  description: "The original BedaManush look: dark, lime accent, video hero and thumbnails.",
  design: { theme: "dark", accentColor: "#C8FF3D", accentTextColor: "#1F1F1F", font: "hind", radius: "soft", spacing: "comfortable", buttonShape: "rounded", headlineSize: "normal" },
  starter: [
    { type: "hero" }, { type: "problems" }, { type: "products" }, { type: "comparison" }, { type: "gallery" },
    { type: "howto" }, { type: "reviews" }, { type: "faq" }, { type: "cta" }, { type: "order" },
  ],
  components: {},
};
