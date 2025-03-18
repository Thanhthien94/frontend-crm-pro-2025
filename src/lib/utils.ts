import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  if (!date) return 'N/A';
  
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch (error) {
    console.error('Date format error:', error);
    return 'Invalid date';
  }
}

export function formatDateTime(date: string | Date): string {
  if (!date) return 'N/A';
  
  try {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Date format error:', error);
    return 'Invalid date';
  }
}