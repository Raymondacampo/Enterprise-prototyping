import type { NextConfig } from "next/types";

const nextConfig: NextConfig = {
  output: 'export', // Requerido por Tauri para empaquetar HTML/JS estático
  images: {
    unoptimized: true, // Requerido cuando se usa output: 'export'
  },
};

export default nextConfig;
