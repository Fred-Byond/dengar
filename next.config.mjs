/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for the Docker runtime image (copies .next/standalone).
  output: "standalone",
  // Lint is run explicitly via `npm run lint`, not coupled to the build.
  eslint: { ignoreDuringBuilds: true },
  // The approved prototypes are served verbatim from /public/prototypes.
  // They render inside the app at /experience and /dashboard until the
  // React componentisation milestone (see docs/ROADMAP.md, Phase 1) replaces them.
};

export default nextConfig;
