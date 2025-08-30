/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")(
  // This is the default (also the `src` folder is supported out of the box)
  "./src/i18n.ts"
)

const nextConfig = {
  transpilePackages: ["antd", "antd-style"],
  reactStrictMode: true,
  swcMinify: true,
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
