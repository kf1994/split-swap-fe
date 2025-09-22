/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")(
  // This is the default (also the `src` folder is supported out of the box)
  "./src/i18n.ts"
)

const nextConfig = {
  transpilePackages: [],
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // Prevent optional pretty printer from being resolved by WalletConnect/pino chains
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "pino-pretty": false
    }
    return config
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/swap",
        permanent: true
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  }
}

module.exports = withNextIntl(nextConfig)

// protoc -I=../services/idl channels.proto \
// --js_out=import_style=commonjs:./src/proto \
// --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src/proto

// brew install protoc-gen-grpc-web
