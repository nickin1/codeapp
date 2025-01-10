import type { NextConfig } from "next";
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'python', 'cpp', 'java', 'c'],
          filename: 'static/[name].worker.js'
        })
      );
    }

    return config;
  },
  transpilePackages: ['monaco-editor'],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
