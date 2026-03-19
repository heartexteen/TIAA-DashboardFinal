/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/TIAA-DashboardFinal",
  assetPrefix: "/TIAA-DashboardFinal",
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;
