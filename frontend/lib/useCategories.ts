import { useEffect, useState } from 'react';
import { errorMessages, getCategories } from './api';
import type { Category } from './types';

interface CategoriesState {
  /** `null` selama masih dimuat. */
  categories: Category[] | null;
  errors: string[];
}

/** Daftar kategori global dari GET /categories (butuh login). */
export function useCategories(): CategoriesState {
  const [state, setState] = useState<CategoriesState>({
    categories: null,
    errors: [],
  });

  useEffect(() => {
    let active = true;
    getCategories()
      .then((categories) => {
        if (active) setState({ categories, errors: [] });
      })
      .catch((error: unknown) => {
        if (active) setState({ categories: [], errors: errorMessages(error) });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
