/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: "build_node",
    env: {
        URL_API: "http://127.0.0.1:5000/"
        
    }
};
export default nextConfig;
