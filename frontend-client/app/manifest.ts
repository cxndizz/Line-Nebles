import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Nebles - Residence Management',
        short_name: 'Nebles',
        description: 'Modern residence management for owners and renters',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e293b',
        icons: [
            {
                src: '/images/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/images/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
