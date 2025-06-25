'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BookDetails, LibraryEntry } from '@/types';
import { AIService, BookAPI, LibraryAPI } from '@/lib/api';
import BookCard from '@/components/BookCard';
import BookPreview from '@/components/BookPreview';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import { truncateText, formatAuthors } from '@/lib/utils';

function SuggestionsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [selectedBooks, setSelectedBooks] = useState<BookDetails[]>([]);
  const [recommendations, setRecommendations] = useState<BookDetails[]>([]);
  const [previewBook, setPreviewBook] = useState<BookDetails | null>(null);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showYourBooks, setShowYourBooks] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const booksParam = searchParams.get('books');
        if (!booksParam) {
          setError('No books selected. Please go back and select some books first.');
          setLoading(false);
          return;
        }

        const bookKeys = booksParam.split(',');

        // Load selected books details
        setLoading(true);
                 const booksPromises = bookKeys.map((key: string) => BookAPI.getBookDetails(key));
         const booksResults = await Promise.all(booksPromises);
         const validBooks = booksResults.filter((book: BookDetails | null): book is BookDetails => book !== null);

        if (validBooks.length === 0) {
          setError('Could not load book details. Please try again.');
          setLoading(false);
          return;
        }

        setSelectedBooks(validBooks);

        // Fetch user's library to mark ownership
        const libEntries = await LibraryAPI.getLibrary();
        setLibrary(libEntries);

        // Get AI recommendations
        const recommendationsData = await AIService.getRecommendations(validBooks);
        setRecommendations(recommendationsData);

        // Set first recommendation as preview
        if (recommendationsData.length > 0) {
          setPreviewBook(recommendationsData[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading suggestions:', err);
        setError('Failed to load suggestions. Please try again.');
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const handleBackToSearch = () => {
    router.push('/search');
  };

  // Helper to check ownership
  const isOwned = (key: string) => library.some((e) => e.key === key);

  // Helper to find read status
  const getReadStatus = (key: string) => library.find((e) => e.key === key)?.read;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Generating your personalized recommendations...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a moment as our AI analyzes the web</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button
            onClick={handleBackToSearch}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToSearch}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Search</span>
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-white">Your AI Recommendations</h1>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Based on {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} you selected
          </div>
        </div>
      </header>

             {/* Main Content - Two Column Layout (Responsive) */}
       <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
         {/* Left Column: Detailed Preview */}
         <div className="w-full lg:w-3/5 border-r-0 lg:border-r border-gray-700 border-b lg:border-b-0 flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Book Details</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {previewBook ? (
              <BookPreview book={previewBook} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p>Select a recommendation to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

                 {/* Right Column: Lists */}
         <div className="w-full lg:w-2/5 flex flex-col">
          {/* Your Books Card */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => setShowYourBooks((prev) => !prev)}
              className="w-full p-4 bg-gray-800 flex items-center justify-between focus:outline-none"
            >
              <h3 className="text-lg font-semibold text-white">Your Books</h3>
              {showYourBooks ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showYourBooks && (
              <div className="max-h-64 overflow-y-auto p-4">
                {selectedBooks.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">No books selected</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedBooks.map((book) => (
                      <BookCard
                        key={book.key}
                        book={book}
                        onPreview={setPreviewBook}
                        size="small"
                        owned={isOwned(book.key)}
                        read={isOwned(book.key) ? getReadStatus(book.key) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Suggestions Card */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
              </div>
              {recommendations.length > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No recommendations available</p>
                  <p className="text-sm mt-2">Please try again later</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((book) => (
                    <div
                      key={book.key}
                      className={`bg-gray-800 rounded-lg border border-gray-700 p-3 cursor-pointer hover:ring-2 hover:ring-primary-500 transition ${
                        previewBook?.key === book.key ? 'ring-2 ring-primary-500' : ''
                      }`}
                      onClick={() => setPreviewBook(book)}
                    >
                      {/* Top: Book info */}
                      <div className="flex space-x-3">
                        <div className="w-14 h-20 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                          {book.coverUrl ? (
                            <Image
                              src={book.coverUrl}
                              alt={`Cover of ${book.title}`}
                              width={56}
                              height={80}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Cover</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white leading-tight">
                            {truncateText(book.title, 50)}
                          </h4>
                          <p className="text-xs text-gray-400 mb-1">
                            {formatAuthors(book.authors)}
                          </p>
                        </div>
                      </div>

                      {/* Subjects */}
                      {book.subjects && book.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {book.subjects.slice(0, 4).map((subject, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded-full">
                              {subject}
                            </span>
                          ))}
                          {book.subjects.length > 4 && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded-full">
                              +{book.subjects.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Summary */}
                      {book.description && (
                        <p className="text-xs text-gray-400 mt-2">
                          {truncateText(book.description, 100)}
                        </p>
                      )}

                      {/* Why recommended */}
                      {'reason' in book && book.reason && (
                        <p className="text-xs italic text-gray-500 mt-2">
                          {book.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuggestionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><LoadingSpinner /></div>}>
      <SuggestionsPageInner />
    </Suspense>
  );
}