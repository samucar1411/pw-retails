import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProxyUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') return null;
  
  const cleanUrl = url.trim();
  
  // If it's already a relative URL, return as is
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }
  
  // If it's a full backend URL from sys.adminpy.com, use our media proxy to bypass SSL issues
  if (cleanUrl.includes('sys.adminpy.com')) {
    // Use our media proxy route that bypasses SSL certificate validation
    return `/api/media?url=${encodeURIComponent(cleanUrl)}`;
  }
  
  // If it's any HTTPS URL that might have SSL issues, proxy it
  if (cleanUrl.startsWith('https://')) {
    return `/api/media?url=${encodeURIComponent(cleanUrl)}`;
  }
  
  // If it's a relative URL without leading slash, add it
  if (!cleanUrl.startsWith('http')) {
    return `/${cleanUrl}`;
  }
  
  // For HTTP URLs, return as is (no SSL issues)
  return cleanUrl;
}

export function getSafeImageUrl(url: string | null | undefined, fallback: string = '/logo-light.png'): string {
  if (!url) return fallback;
  
  const cleanUrl = url.replace(/\s+/g, '').trim();
  if (!cleanUrl) return fallback;
  
  // Always use proxy for external URLs to avoid CORS and SSL issues
  if (cleanUrl.startsWith('http')) {
    return `/api/media?url=${encodeURIComponent(cleanUrl)}`;
  }
  
  return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
}

