import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'taslak':
      return 'bg-secondary-100 text-secondary-700';
    case 'atanmayı_bekleyen':
      return 'bg-warning-100 text-warning-700';
    case 'atanan':
      return 'bg-primary-100 text-primary-700';
    case 'çözüm_bekleyen':
      return 'bg-accent-100 text-accent-700';
    case 'kapatma_onayında':
      return 'bg-success-100 text-success-700';
    case 'kapatıldı':
      return 'bg-success-200 text-success-800';
    case 'reddedildi':
      return 'bg-danger-100 text-danger-700';
    case 'iptal':
      return 'bg-secondary-200 text-secondary-800';
    default:
      return 'bg-secondary-100 text-secondary-700';
  }
}

export function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case 'düşük':
      return 'bg-success-100 text-success-700';
    case 'orta':
      return 'bg-warning-100 text-warning-700';
    case 'yüksek':
      return 'bg-danger-100 text-danger-700';
    case 'kritik':
      return 'bg-danger-200 text-danger-800';
    default:
      return 'bg-secondary-100 text-secondary-700';
  }
}
