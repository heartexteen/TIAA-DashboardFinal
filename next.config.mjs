/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/TIAA-DashboardFinal",
  assetPrefix: "/TIAA-DashboardFinal",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;