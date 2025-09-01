import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Ignora errores de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignora errores de TypeScript durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
