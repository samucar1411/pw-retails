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
  
  // Return original URL for other cases
  return url;
}
