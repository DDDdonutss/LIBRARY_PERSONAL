// Kelas Tailwind yang dipakai berulang, agar tampilan konsisten.

export const inputClass =
  'mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100';

export const labelClass = 'block text-sm font-medium text-gray-700';

const buttonBase =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

export const primaryButtonClass = `${buttonBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;

export const secondaryButtonClass = `${buttonBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500`;

export const dangerButtonClass = `${buttonBase} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;

export const cardClass = 'rounded-lg border border-gray-200 bg-white p-6 shadow-sm';
