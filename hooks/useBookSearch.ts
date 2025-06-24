import { useState, useEffect, useCallback } from 'react';
import { BookDetails, LoadingState } from '@/types';
import { BookAPI } from '@/lib/api';
import { debounce } from '@/lib/utils';

export function useBookSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookDetails[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });

  const searchBooks = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setLoading({ isLoading: false });
      return;
    }

    setLoading({ isLoading: true, error: undefined });

    try {
      const books = await BookAPI.searchBooks(searchQuery);
      setResults(books);
      setLoading({ isLoading: false });
    } catch (error) {
      setLoading({ 
        isLoading: false, 
        error: 'Failed to search books. Please try again.' 
      });
      setResults([]);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => searchBooks(searchQuery), 500),
    [searchBooks]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  return {
    query,
    results,
    loading,
    updateQuery,
  };
} 