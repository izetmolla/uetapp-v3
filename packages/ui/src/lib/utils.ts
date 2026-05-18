import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function generateAvatarFallback(string: string) {
  const words = string?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (words.length === 0) return "";
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  const first = words[0].charAt(0).toUpperCase();
  const last = words[words.length - 1].charAt(0).toUpperCase();
  return `${first}${last}`;
}


