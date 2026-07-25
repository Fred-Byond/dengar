/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for the Docker runtime image (copies .next/standalone).
  output: "standalone",
  // Lint is run explicitly via `npm run lint`, not coupled to the build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
