import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, context) => {
    // Copy template files to build output
    config.module.rules.push({
      test: /\.hbs$/,
      type: "asset/resource",
      generator: {
        filepath: "templates/[name][ext]",
      },
    });

    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          handlebars: "handlebars/dist/handlebars.js",
        },
      },
    };
  },
};

export default nextConfig;
