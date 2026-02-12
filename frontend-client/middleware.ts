import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let locales = ["th", "en", "cn"];

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest) {
    // Check cookie first
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
        return cookieLocale;
    }

    // Check Accept-Language header
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage
            .split(",")
            .map((lang) => lang.split(";")[0].trim().substring(0, 2)) // 'en-US' -> 'en'
            .find((lang) => locales.includes(lang));

        if (preferredLocale) return preferredLocale;
    }

    // Default
    return "th";
}

export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl;

    // Skip public files and api routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/static") ||
        pathname.includes(".") // file.ext
    ) {
        return;
    }

    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // Redirect if there is no locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        // "/((?!_next).*)",
        // Optional: only run on root (/)
        "/", "/renter", "/owner"
    ],
};
