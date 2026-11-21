const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Tanggal ISO 8601 UTC dari API → waktu lokal, mis. "21 Nov 2026, 15.20". */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(Date.parse(iso));
}
