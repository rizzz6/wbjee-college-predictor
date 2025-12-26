'use client';

import dynamic from 'next/dynamic';

const EasterEggManager = dynamic(() => import('./EasterEggManager'), {
    ssr: false,
});

export default function EasterEggLoader() {
    return <EasterEggManager />;
}
