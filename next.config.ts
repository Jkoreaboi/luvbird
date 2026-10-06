import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/brand-mark.svg", permanent: false }];
  },
};

export default nextConfig;
