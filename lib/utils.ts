import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProxyUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If it's already a relative URL, return as is
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's a full backend URL, convert to proxy
  if (url.includes('sys.adminpy.com')) {
    // Extract the path after /media/
    const mediaMatch = url.match(/\/media\/(.+)$/);
    if (mediaMatch) {
      return `/media/${mediaMatch[1]}`;
    }
    
    // If it's not a media URL, return the original
    return url;
  }
  
  // If it's a relative URL without leading slash, add it
  if (!url.startsWith('http')) {
    return `/${url}`;
  }
  
  // Return original URL for other cases
  return url;
}

export function getSafeImageUrl(url: string | null | undefined, fallback: string = '/logo-light.png'): string {
  if (!url) return fallback;
  
  const proxyUrl = getProxyUrl(url);
  return proxyUrl || fallback;
}

