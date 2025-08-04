import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProxyUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  if (url.startsWith('/')) {
    return url;
  }
  
  if (!url.startsWith('http')) {
    return `/${url}`;
  }
  
  // Check for known problematic URLs or domains
  if (url.includes('pf-logo.jpeg') || url.includes('sys.adminpy.com')) {
    console.warn('Blocked potentially problematic image URL:', url);
    return null; // Return null to trigger fallback image
  }
  
  // Return original URL for other cases
  return url;
}

export function getSafeImageUrl(url: string | null | undefined, fallback: string = '/images/default-logo.png'): string {
  const proxyUrl = getProxyUrl(url);
  return proxyUrl || fallback;
}
