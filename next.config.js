/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly disable turbopack
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      
      // Externalize Noir packages - don't bundle them
      config.externals.push({
        '@noir-lang/backend_barretenberg': 'commonjs @noir-lang/backend_barretenberg',
        '@noir-lang/noir_js': 'commonjs @noir-lang/noir_js',
      });
    }

    return config;
  },
  
  // Server-side only for API routes
  serverExternalPackages: [
    '@noir-lang/backend_barretenberg',
    '@noir-lang/noir_js',
  ],
};

module.exports = nextConfig;
