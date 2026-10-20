/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Temporary so the default landing page can change later without
      // browsers having cached the old one.
      { source: "/", destination: "/remodels", permanent: false },
      // Old bid URLs from before there were separate project types.
      { source: "/bid/remodel", destination: "/bid/remodels", permanent: true },
      { source: "/bid/remodel/referrals", destination: "/bid/remodels/referrals", permanent: true },
    ];
  },
};

export default nextConfig;
