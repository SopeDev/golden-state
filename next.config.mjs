import createNextIntlPlugin from 'next-intl/plugin'
 
const withNextIntl = createNextIntlPlugin()
 
/** @type {import('next').NextConfig} */
const nextConfig = {
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