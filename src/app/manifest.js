export default function manifest() {
  return {
    name: 'Golden State Capital',
    short_name: 'Golden State',
    description:
      'Premium California real estate investment opportunities from Golden State Capital Management.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d2642',
    theme_color: '#0d2642',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
