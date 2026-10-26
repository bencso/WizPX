import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    // Fejlesztői alacsony-memória mód (NEXT_DEV_LOW_MEMORY=true): a webpack memóriában tartott gyorsítótára
    // kb. 600 MB-ot foglal. Kikapcsolva a konténer újraindítása után az első oldalbetöltés lassabb.
    if (dev && process.env.NEXT_DEV_LOW_MEMORY === "true") {
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;
