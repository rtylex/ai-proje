/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-aiproje';
    const region = process.env.NEXT_PUBLIC_FIREBASE_LOCATION || 'europe-west1';
    const target = process.env.NEXT_PUBLIC_API_URL || `http://127.0.0.1:5001/${projectId}/${region}/api`;
    return [
      {
        source: '/api/:path*',
        destination: `${target}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
