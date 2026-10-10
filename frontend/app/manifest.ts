import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ayoj — Premium Event Marketplace',
    short_name: 'Ayoj',
    description: 'Connect with verified photographers, videographers, and event managers for landmark celebrations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#9E5338',
    icons: [
      {
        src: '/images/ayoj-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
