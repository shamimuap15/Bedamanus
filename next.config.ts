import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  // The old "Page sections" screens were replaced by Pages + the theme editor.
  async redirects() {
    return [
      { source: "/admin/sections", destination: "/admin/pages", permanent: false },
      { source: "/admin/sections/:id", destination: "/admin/pages", permanent: false },
    ];
  },
};

export default nextConfig;
