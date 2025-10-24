import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add empty turbopack config to silence the warning
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
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
