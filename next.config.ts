import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Alias React Native-only async storage to a web shim so browser builds don't try to resolve it
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": require("path").resolve(
        __dirname,
        "./lib/asyncStorageShim.ts"
      ),
    };
    return config;
  },
};

export default nextConfig;
