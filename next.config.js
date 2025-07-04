// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs');
const nextTranslate = require('next-translate-plugin')

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/es/terms-of-service',
        destination: '/es/terminos-servicio',
        permanent: true,
        locale: false,
      },
      {
        source: '/es/privacy-notice',
        destination: '/es/aviso-privacidad',
        permanent: true,
        locale: false,
      },
      {
        source: '/es/faq',
        destination: '/es/preguntas-frecuentes',
        permanent: true,
        locale: false,
      },
      {
        source: '/en/preguntas-frecuentes',
        destination: '/faq',
        permanent: true,
        locale: false,
      },
      {
        source: '/es/how-it-works',
        destination: '/es/como-funciona',
        permanent: true,
        locale: false,
      },
      {
        source: '/es/contact',
        destination: '/es/contacto',
        permanent: true,
        locale: false,
      },
      {
        source: '/es/pricing',
        destination: '/es/precios',
        permanent: true,
        locale: false,
      },
      {
        source: '/es/panel',
        destination: '/es/dashboard',
        permanent: true,
        locale: false,
      },
      {
        source: '/post/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/privacy-notice',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/terms-of-service',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap',
      },
      {
        source: '/preguntas-frecuentes',
        destination: '/faq',
      },
      {
        source: '/ayuda',
        destination: '/help',
      },
      {
        source: '/ayuda/:slug',
        destination: '/help/:slug',
      },
    ]
  },
}

module.exports = nextTranslate(
  withSentryConfig(
    nextConfig,
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      org: "tonymtz",
      project: "tomatoro-com",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Automatically annotate React components to show their full name in breadcrumbs and session replay
      reactComponentAnnotation: {
        enabled: true,
      },

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: "/monitoring",

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: "/monitoring",

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    },
  ),
);
