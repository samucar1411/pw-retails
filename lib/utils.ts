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
  
  // Return URLs directly without proxy
  if (cleanUrl.startsWith('http')) {
    return cleanUrl;
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
  
  // Return external URLs directly
  if (cleanUrl.startsWith('http')) {
    return cleanUrl;
  }
  
  return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
}

