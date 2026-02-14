import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Find Your Perfect Condo in Bangkok | NEBLES',
    description: 'Looking for a luxury condo in Bangkok? Tell us your budget and preferences (Thong Lo, Phrom Phong, Asoke). We match you with the best options.',
    keywords: ['Bangkok Condo', 'Rent Condo Bangkok', 'Luxury Real Estate Thailand', 'Thong Lo Condo', 'Phrom Phong Condo', 'Nebles'],
    openGraph: {
        title: 'Find Your Perfect Condo in Bangkok | NEBLES',
        description: 'Looking for a luxury condo in Bangkok? Tell us your budget and preferences.',
        siteName: 'NEBLES Residence Management',
        locale: 'en_US',
        type: 'website',
        images: [
            {
                url: '/images/logo.png',
                width: 800,
                height: 800,
                alt: 'NEBLES Logo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Find Your Perfect Condo in Bangkok | NEBLES',
        description: 'Looking for a luxury condo in Bangkok? Tell us your budget and preferences.',
    },
    alternates: {
        canonical: 'https://nebles.needhome.co/en/renter',
        languages: {
            'en': 'https://nebles.needhome.co/en/renter',
            'th': 'https://nebles.needhome.co/th/renter',
            'zh': 'https://nebles.needhome.co/cn/renter',
        },
    },
};

export default function RenterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        name: 'NEBLES',
        description: 'Premium Condo Rental Service in Bangkok',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Bangkok',
            addressCountry: 'TH',
        },
        priceRange: '฿10,000 - ฿150,000+',
        areaServed: [
            {
                '@type': 'Place',
                name: 'Thong Lo'
            },
            {
                '@type': 'Place',
                name: 'Phrom Phong'
            },
            {
                '@type': 'Place',
                name: 'Asoke'
            }
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
