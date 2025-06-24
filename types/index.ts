export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  subject?: string[];
  description?: string;
  publisher?: string[];
}

export interface BookDetails {
  key: string;
  title: string;
  authors: string[];
  publishYear?: number;
  coverUrl?: string;
  description?: string;
  isbn?: string;
  publishers?: string[];
  subjects?: string[];
  /**
   * Present only for AI-recommended books: a short explanation returned by the LLM
   * stating why this title was suggested.
   */
  reason?: string;
}

export interface SearchResponse {
  docs: Book[];
  numFound: number;
  start: number;
}

export interface AIRecommendation {
  title: string;
  author: string;
  /** why the LLM picked this book */
  reason: string;
}

export interface UserSelection {
  books: BookDetails[];
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
} 