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
  
  // Return original URL for other cases (external CDNs, etc)
  return url;
}

export function getSafeImageUrl(url: string | null | undefined, fallback: string = '/logo-light.png'): string {
  const proxyUrl = getProxyUrl(url);
  return proxyUrl || fallback;
}
