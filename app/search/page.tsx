'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, ArrowLeft, LogOut } from 'lucide-react';
import { BookDetails } from '@/types';
import { useBookSearch } from '@/hooks/useBookSearch';
import { useUserSelection } from '@/hooks/useUserSelection';
import BookCard from '@/components/BookCard';
import BookPreview from '@/components/BookPreview';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const { query, results, loading, updateQuery } = useBookSearch();
  const { selectedBooks, addBook, removeBook, isBookSelected, hasSelection } = useUserSelection();
  const [previewBook, setPreviewBook] = useState<BookDetails | null>(null);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const handleGetSuggestions = () => {
    if (hasSelection) {
      const bookIds = selectedBooks.map(book => book.key).join(',');
      window.location.href = `/suggestions?books=${encodeURIComponent(bookIds)}`;
    }
  };

  const handleBackToLanding = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button
              onClick={handleBackToLanding}
              className="flex items-center space-x-1 lg:space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-primary-500" />
              <h1 className="text-xl lg:text-2xl font-bold text-white">Bookgestions</h1>
            </div>
          </div>
          <div className="text-xs lg:text-sm text-gray-400 hidden md:flex items-center space-x-4">
            <span className="hidden lg:inline">Find books you love, get AI recommendations</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout (Responsive) */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Column 1: Search & Results */}
        <div className="w-full lg:w-1/3 border-r-0 lg:border-r border-gray-700 border-b lg:border-b-0 flex flex-col lg:h-[calc(100vh-80px)]">
          <div className="p-4 lg:p-6 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for books..."
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-[40vh] lg:min-h-0">
            {loading.isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : loading.error ? (
              <div className="text-center py-8 text-red-400">
                {loading.error}
              </div>
            ) : query.length > 0 && query.length < 3 ? (
              <div className="text-center py-8 text-gray-400">
                Type at least 3 characters to search
              </div>
            ) : results.length === 0 && query.length >= 3 ? (
              <div className="text-center py-8 text-gray-400">
                No books found for "{query}"
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((book) => (
                  <BookCard
                    key={book.key}
                    book={book}
                    onAdd={addBook}
                    onPreview={setPreviewBook}
                    isSelected={isBookSelected(book.key)}
                    showAddButton={true}
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: User's Selections */}
        <div className="w-full lg:w-1/3 border-r-0 lg:border-r border-gray-700 border-b lg:border-b-0 flex flex-col lg:h-[calc(100vh-80px)]">
          <div className="p-4 lg:p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Your Selections</h2>
            <button
              onClick={handleGetSuggestions}
              disabled={!hasSelection}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Get Suggestions ({selectedBooks.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-[40vh] lg:min-h-0">
            {selectedBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No books selected yet</p>
                <p className="text-sm mt-2">Search and add books to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedBooks.map((book) => (
                  <BookCard
                    key={book.key}
                    book={book}
                    onRemove={removeBook}
                    onPreview={setPreviewBook}
                    showRemoveButton={true}
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Book Preview */}
        <div className="w-full lg:w-1/3 flex flex-col lg:h-[calc(100vh-80px)]">
          <div className="p-4 lg:p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Book Preview</h2>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[40vh] lg:min-h-0">
            {previewBook ? (
              <BookPreview book={previewBook} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p>Select a book to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 