/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  }
];

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ["docx", "pdfmake"]
  },
  poweredByHeader: false,
  async headers() {
    const headers = [...securityHeaders];
    if (isProd) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains"
      });
    }
    return [{ source: "/:path*", headers }];
  }
};

export default nextConfig;
