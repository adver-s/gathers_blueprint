import type { NextConfig } from "next";

/**
 * 開発時の API プロキシは `app/api-proxy/[[...path]]/route.ts` で行う（rewrites は
 * Turbopack 環境で 500 になる報告があるため避ける）。
 */
const nextConfig: NextConfig = {};

export default nextConfig;
