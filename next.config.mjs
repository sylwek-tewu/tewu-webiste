/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // Each locale has its own root layout ((pl), (uk)), so there is no top-level layout
        // for unmatched URLs; src/app/global-not-found.tsx renders them instead.
        globalNotFound: true,
    },
};

export default nextConfig;
