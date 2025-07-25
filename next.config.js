/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 忽略 ESLint 错误，允许即使有错误也能构建成功
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 忽略 TypeScript 类型检查错误，允许即使有错误也能构建成功
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 