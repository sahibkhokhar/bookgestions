import { useState, useCallback } from 'react';
import { BookDetails } from '@/types';

export function useUserSelection() {
  const [selectedBooks, setSelectedBooks] = useState<BookDetails[]>([]);

  const addBook = useCallback((book: BookDetails) => {
    setSelectedBooks(prev => {
      // Check if book is already selected
      if (prev.some(b => b.key === book.key)) {
        return prev;
      }
      return [...prev, book];
    });
  }, []);

  const removeBook = useCallback((bookKey: string) => {
    setSelectedBooks(prev => prev.filter(book => book.key !== bookKey));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBooks([]);
  }, []);

  const isBookSelected = useCallback((bookKey: string) => {
    return selectedBooks.some(book => book.key === bookKey);
  }, [selectedBooks]);

  return {
    selectedBooks,
    addBook,
    removeBook,
    clearSelection,
    isBookSelected,
    hasSelection: selectedBooks.length > 0,
  };
} 