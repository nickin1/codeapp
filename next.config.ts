import type { NextConfig } from "next";
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      };

      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'python', 'cpp', 'java', 'c'],
          filename: 'static/[name].worker.js',
        })
      );
    }
    return config;
  },
  transpilePackages: ['monaco-editor']
};

export default nextConfig;
