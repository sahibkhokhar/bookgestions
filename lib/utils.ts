import { Book, BookDetails } from '@/types';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function transformBookToDetails(book: Book): BookDetails {
  return {
    key: book.key,
    title: book.title,
    authors: book.author_name || [],
    publishYear: book.first_publish_year,
    coverUrl: book.cover_i 
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : undefined,
    isbn: book.isbn?.[0],
    publishers: book.publisher,
    subjects: book.subject,
  };
}

export function getCoverUrl(coverId: number | string, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors[0]} and ${authors.length - 1} others`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 