import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';

    // 1. Bot Detection (Critical for SEO)
    // Bots (Googlebot, etc.) need to see content immediately. Treat them as Desktop.
    // This must be the FIRST check.
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|twitterbot|whatsapp|slackbot|discordbot|telegrambot/i.test(userAgent);
    if (isBot) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-device-type', 'desktop');

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
        response.headers.set('x-device-type', 'desktop'); // For debugging/CDN
        response.headers.set('Vary', 'x-device-type'); // Essential for cache
        return response;
    }



    // 2. Slow Network / Data Saver Detection
    // If user explicitly requests data savings, FORCE mobile (lazy) strategy
    const saveData = request.headers.get('save-data');
    const isSaveData = saveData === 'on';
    if (isSaveData) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-device-type', 'mobile');

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
        response.headers.set('x-device-type', 'mobile'); // For debugging/CDN
        response.headers.set('Vary', 'x-device-type');
        return response;
    }

    // 3. Device Detection Strategy: Defensive Defaulting
    // Goal: Identify "Definitely Desktop". Everything else gets Mobile (Lazy).
    // Why? WhatsApp/In-App browsers often have weird UAs. Better to serve light 30KB
    // to a desktop than 184KB to a low-end phone.

    const isWindows = /Windows NT/i.test(userAgent);
    const isMac = /Macintosh/i.test(userAgent) && !/Mobile|iPhone|iPad|iPod/i.test(userAgent);
    const isLinuxDesktop = /X11;.*Linux/i.test(userAgent) && !/Android/i.test(userAgent);

    // iPad Pro often mimics Mac. We treat expensive tablets as Desktop.
    // Note: We cannot check navigator.maxTouchPoints in middleware (server-side).
    // We rely strictly on the User-Agent string.
    // Android tablets: Look for "Tablet" keyword OR Samsung Galaxy Tab models (SM-T, SM-P, etc.)
    const isTablet = /iPad|Tablet|SM-T\d+|SM-P\d+|Tab\s+\d+/i.test(userAgent);

    const isDefinitelyDesktop = isWindows || isMac || isLinuxDesktop || isTablet;

    const deviceType = isDefinitelyDesktop ? 'desktop' : 'mobile';

    // Inject header into REQUEST (so page.tsx can read it)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-device-type', deviceType);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Also set on RESPONSE (for debugging/CDN)
    response.headers.set('x-device-type', deviceType);
    response.headers.set('Vary', 'x-device-type');

    return response;
}

// Apply to cutoffs page only
export const config = {
    matcher: '/cutoffs',
};
