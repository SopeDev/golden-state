import createNextIntlPlugin from 'next-intl/plugin'
import {
  SAME_ORIGIN_DOCUMENT_HEADERS,
  SECURITY_HEADERS,
} from './src/lib/security/headers.js'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        source: '/api/investor-documents/:id',
        headers: SAME_ORIGIN_DOCUMENT_HEADERS,
      },
      {
        source: '/api/property-documents/:id',
        headers: SAME_ORIGIN_DOCUMENT_HEADERS,
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/uploads/investors/:path*',
          destination: '/api/blocked-upload',
        },
      ],
    }
  },
  async redirects() {
    return [
      {
        source: '/:locale(en|es)/fliphouses',
        destination: '/:locale/projects/fliphouses',
        permanent: true,
      },
      {
        source: '/:locale(en|es)/buytorent',
        destination: '/:locale/projects/build-to-rent',
        permanent: true,
      },
      {
        source: '/:locale(en|es)/buytobuild',
        destination: '/:locale/projects/build-to-rent',
        permanent: true,
      },
      {
        source: '/:locale(en|es)/mexicotous',
        destination: '/:locale/projects/mex-to-us',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
