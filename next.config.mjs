import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    serverExternalPackages: ['better-sqlite3'],
    outputFileTracingRoot: __dirname,
    turbopack: {
        root: __dirname,
    },
    experimental: {
        // Each locale has its own root layout ((pl), (uk)), so there is no top-level layout
        // for unmatched URLs; src/app/global-not-found.tsx renders them instead.
        globalNotFound: true,
    },
};

export default nextConfig;
