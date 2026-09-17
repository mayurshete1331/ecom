export default function manifest() {
  return {
    name: 'KisanDirect | Fresh Sprouts & Produce',
    short_name: 'KisanDirect',
    description: 'Instant 15-min farm fresh sprouts & exotic vegetables + Hotel Wholesale bulk delivery',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#059669',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  };
}
