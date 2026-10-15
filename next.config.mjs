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
    async headers() {
        return [
            {
                // Everything except the production host stays out of the index (Preview
                // Deployments, the bare IP, a stray domain). Next.js matches the Host header
                // without the port, lowercased, and anchors the pattern itself.
                source: '/:path*',
                missing: [{ type: 'host', value: '^tewu\\.szczecin\\.pl$' }],
                headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
            },
        ];
    },
    async redirects() {
        return [
            {
                // Fallback only: Coolify already redirects www to the apex domain.
                source: '/:path*',
                has: [{ type: 'host', value: '^www\\.tewu\\.szczecin\\.pl$' }],
                destination: 'https://tewu.szczecin.pl/:path*',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
