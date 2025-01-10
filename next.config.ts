import type { NextConfig } from "next";
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'python', 'cpp', 'java', 'c'],
          filename: 'static/[name].worker.js'
        })
      );
    }

    if (isServer) {
      config.externals = [...(config.externals as string[]), 'dockerode']
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['dockerode']
  },
  transpilePackages: ['monaco-editor'],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
