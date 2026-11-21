import type { BookStatus } from './types';

/** Urutan status yang ditampilkan di pilihan dan dashboard. */
export const BOOK_STATUSES: readonly BookStatus[] = [
  'WANT_TO_READ',
  'READING',
  'COMPLETED',
];

/** Label status di layar (PRD §5). Nilai API tidak pernah ditampilkan langsung. */
export const STATUS_LABELS: Record<BookStatus, string> = {
  WANT_TO_READ: 'Ingin dibaca',
  READING: 'Sedang dibaca',
  COMPLETED: 'Selesai dibaca',
};
