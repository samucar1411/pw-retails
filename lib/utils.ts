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
  
  // Force HTTP instead of HTTPS to avoid SSL certificate issues
  if (url.startsWith('https://')) {
    return url.replace('https://', 'http://');
  }
  
  return url;
}

export function getSafeImageUrl(url: string | null | undefined, fallback: string = '/logo-light.png'): string {
  if (!url) return fallback;
  
  const proxyUrl = getProxyUrl(url);
  return proxyUrl || fallback;
}
