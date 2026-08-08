import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel Image Optimization isn't available on this account (/_next/image → 402),
  // and our only image is a local static asset, so serve it as-is.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
