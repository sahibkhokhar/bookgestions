import axios from 'axios';
import { Book, SearchResponse, BookDetails, AIRecommendation, LibraryEntry, WantToReadEntry } from '@/types';
import { transformBookToDetails } from './utils';

const OPENLIBRARY_BASE_URL = 'https://openlibrary.org';

export class BookAPI {
  static async searchBooks(query: string, limit: number = 10): Promise<BookDetails[]> {
    try {
      const response = await axios.get<SearchResponse>(`${OPENLIBRARY_BASE_URL}/search.json`, {
        params: {
          q: query,
          limit,
          lang: 'en',
          fields: 'key,title,author_name,first_publish_year,cover_i,isbn,subject,publisher,language',
        },
      });

      return response.data.docs.map(transformBookToDetails);
    } catch (error) {
      console.error('Error searching books:', error);
      throw new Error('Failed to search books');
    }
  }

  static async getBookDetails(key: string): Promise<BookDetails | null> {
    try {
      const response = await axios.get(`${OPENLIBRARY_BASE_URL}${key}.json`);
      const book = response.data;

      // Get additional details like description
      let description = '';
      if (book.description) {
        description = typeof book.description === 'string'
          ? book.description
          : book.description.value || '';
      }

      // Get cover URL
      let coverUrl = '';
      if (book.covers && book.covers.length > 0) {
        coverUrl = `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`;
      }

      // Get authors
      const authors: string[] = [];
      if (book.authors) {
        for (const authorRef of book.authors) {
          try {
            const authorResponse = await axios.get(`${OPENLIBRARY_BASE_URL}${authorRef.author.key}.json`);
            authors.push(authorResponse.data.name);
          } catch {
            // If author fetch fails, skip
          }
        }
      }

      return {
        key: book.key,
        title: book.title,
        authors,
        publishYear: book.publish_date ? parseInt(book.publish_date) : undefined,
        coverUrl,
        description,
        isbn: book.isbn_13?.[0] || book.isbn_10?.[0],
        publishers: book.publishers,
        subjects: book.subjects,
      };
    } catch (error) {
      console.error('Error fetching book details:', error);
      return null;
    }
  }
}

export class AIService {
  static async getRecommendations(selectedBooks: BookDetails[]): Promise<BookDetails[]> {
    try {
      const response = await axios.post('/api/recommendations', {
        books: selectedBooks.map(book => ({
          title: book.title,
          authors: book.authors,
          publishYear: book.publishYear,
        })),
      });

      const recommendations: AIRecommendation[] = response.data.recommendations;

      // Search for each recommended book to get full details
      const detailedRecommendations: BookDetails[] = [];

      for (const rec of recommendations) {
        try {
          const searchResults = await BookAPI.searchBooks(`${rec.title} ${rec.author}`, 1);
          if (searchResults.length > 0) {
            const detail = { ...searchResults[0], reason: rec.reason } as BookDetails;
            detailedRecommendations.push(detail);
          }
        } catch (error) {
          console.error(`Failed to find details for recommendation: ${rec.title}`, error);
        }
      }

      return detailedRecommendations;
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }
}

export class LibraryAPI {
  static async getLibrary(): Promise<LibraryEntry[]> {
    try {
      const res = await axios.get('/api/library');
      return res.data.entries as LibraryEntry[];
    } catch (err) {
      console.error('Failed to fetch library', err);
      return [];
    }
  }

  static async addToLibrary(book: BookDetails, read: boolean): Promise<boolean> {
    try {
      await axios.post('/api/library', { book, read });
      return true;
    } catch (err) {
      console.error('Failed to add to library', err);
      return false;
    }
  }

  static async updateReadStatus(key: string, read: boolean) {
    try {
      await axios.patch('/api/library', { key, read });
    } catch (err) {
      console.error('Failed to update read status', err);
    }
  }

  static async deleteFromLibrary(key: string) {
    try {
      await axios.delete('/api/library', { params: { key } });
    } catch (err) {
      console.error('Failed to delete from library', err);
    }
  }
}

export class WantToReadAPI {
  static async getList(): Promise<WantToReadEntry[]> {
    try {
      const res = await axios.get('/api/wanttoread');
      return res.data.entries as WantToReadEntry[];
    } catch (err) {
      console.error('Failed to fetch want-to-read list', err);
      return [];
    }
  }

  static async add(book: BookDetails): Promise<boolean> {
    try {
      await axios.post('/api/wanttoread', { book });
      return true;
    } catch (err) {
      console.error('Failed to add to want-to-read', err);
      return false;
    }
  }

  static async delete(key: string) {
    try {
      await axios.delete('/api/wanttoread', { params: { key } });
    } catch (err) {
      console.error('Failed to delete from want-to-read', err);
    }
  }
}