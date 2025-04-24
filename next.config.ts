import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    // 忽略 ESLint 错误，允许即使有错误也能构建成功
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
