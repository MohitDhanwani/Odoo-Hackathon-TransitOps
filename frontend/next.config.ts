import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Determine the backend URL. Fall back to local dev if not provided.
    // If the URL already ends in /api, we handle it carefully, but typically
    // NEXT_PUBLIC_API_URL should just be the base URL (e.g. http://localhost:5000)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
