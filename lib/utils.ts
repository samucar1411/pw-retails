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
  
  // If it's a backend URL (sys.adminpy.com), proxy it through our API route
  if (url.includes('sys.adminpy.com')) {
    try {
      const urlObj = new URL(url);
      // Extract the path from the backend URL and proxy it through /api/media
      const path = urlObj.pathname + urlObj.search;
      return `/api/media${path}`;
    } catch (error) {
      console.error('Error parsing backend URL:', error);
      return null;
    }
  }
  
  // Return original URL for other cases (external CDNs, etc)
  return url;
}

export function getSafeImageUrl(url: string | null | undefined, fallback: string = '/logo-light.png'): string {
  const proxyUrl = getProxyUrl(url);
  return proxyUrl || fallback;
}
