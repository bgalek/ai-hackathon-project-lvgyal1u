/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        remotePatterns: [{ hostname: "tailwindui.com" }],
    },
};

export default nextConfig;
