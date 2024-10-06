/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['lh3.googleusercontent.com'],
    },
    //skip all errors in production build
    typescript: {
        ignoreBuildErrors: true,
    },
    
};

export default nextConfig;
