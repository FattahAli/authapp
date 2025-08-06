import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getGenderLabel(gender: string) {
  switch (gender) {
    case 'MALE':
      return 'Male'
    case 'FEMALE':
      return 'Female'
    case 'OTHER':
      return 'Other'
    case 'PREFER_NOT_TO_SAY':
      return 'Prefer not to say'
    default:
      return gender
  }
} 