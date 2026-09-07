import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cf.shopee.co.th",
        pathname: "/file/**",
      },
    ],
  },
};

export default nextConfig;
