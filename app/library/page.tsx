'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useBookSearch } from '@/hooks/useBookSearch';
import { BookDetails, LibraryEntry } from '@/types';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LibraryAPI } from '@/lib/api';
import { useSession, signIn } from 'next-auth/react';
import { WantToReadAPI } from '@/lib/api';

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const { query, results, loading, updateQuery } = useBookSearch();

  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [defaultRead, setDefaultRead] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [librarySearch, setLibrarySearch] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLibrary();
    }
  }, [status]);

  const fetchLibrary = async () => {
    const entries = await LibraryAPI.getLibrary();
    setLibrary(entries);
  };

  const handleAddBook = async (book: BookDetails) => {
    const success = await LibraryAPI.addToLibrary(book, defaultRead);
    if (success) {
      fetchLibrary();
    }
  };

  const handleAddWant = async (book: BookDetails) => {
    await WantToReadAPI.add(book);
  };

  const toggleReadStatus = async (entry: LibraryEntry) => {
    const newStatus = !entry.read;
    await LibraryAPI.updateReadStatus(entry.key, newStatus);
    setLibrary((prev) =>
      prev.map((e) => (e.key === entry.key ? { ...e, read: newStatus } : e))
    );
  };

  const removeEntry = async (entry: LibraryEntry) => {
    await LibraryAPI.deleteFromLibrary(entry.key);
    setLibrary((prev) => prev.filter((e) => e.key !== entry.key));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white space-y-4">
        <p>You need to sign in to manage your library.</p>
        <button
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded"
          onClick={() => signIn()}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <AppHeader />
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left: Search */}
        <div className="w-full lg:w-1/2 border-r border-gray-700 p-6 flex flex-col">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Search className="w-6 h-6" />
            <span>Search & Add Books</span>
          </h2>

          {/* read/unread toggle */}
          <div className="flex items-center space-x-2 mb-4 text-white">
            <label htmlFor="readToggle" className="text-sm">
              Default status for new books:
            </label>
            <button
              id="readToggle"
              onClick={() => setDefaultRead((prev) => !prev)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                defaultRead ? 'bg-green-600' : 'bg-yellow-600'
              }`}
            >
              {defaultRead ? 'Read' : 'Unread'}
            </button>
          </div>

          {/* Search input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for books..."
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading.isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : loading.error ? (
              <div className="text-center py-8 text-red-400">{loading.error}</div>
            ) : query.length > 0 && query.length < 3 ? (
              <div className="text-center py-8 text-gray-400">Type at least 3 characters to search</div>
            ) : results.length === 0 && query.length >= 3 ? (
              <div className="text-center py-8 text-gray-400">No books found for "{query}"</div>
            ) : (
              <div className="space-y-4">
                {results.map((book) => (
                  <BookCard
                    key={book.key}
                    book={book}
                    onAdd={handleAddBook}
                    showAddButton
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Library */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
            <BookOpen className="w-6 h-6" />
            <span>Your Library ({library.length})</span>
          </h2>

          {/* Library search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your library by title or author..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center space-x-2 mb-4">
            {(
              [
                { label: 'All', value: 'all' },
                { label: 'Read', value: 'read' },
                { label: 'Unread', value: 'unread' },
              ] as const
            ).map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filter === value ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {library.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No books in your library yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {library
                  .filter((e) => {
                    if (filter === 'all') return true;
                    if (filter === 'read') return e.read;
                    return !e.read;
                  })
                  .filter((entry) => {
                    const search = librarySearch.trim().toLowerCase();
                    if (!search) return true;
                    return (
                      entry.title.toLowerCase().includes(search) ||
                      entry.authors.toLowerCase().includes(search)
                    );
                  })
                  .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
                  .map((entry) => (
                    <BookCard
                      key={entry.id}
                      book={{
                        key: entry.key,
                        title: entry.title,
                        authors: entry.authors.split(',').map((a) => a.trim()),
                        coverUrl: entry.coverUrl,
                      } as BookDetails}
                      size="small"
                      read={entry.read}
                      onRemove={() => removeEntry(entry)}
                      overlayRemove
                      onToggleRead={() => toggleReadStatus(entry)}
                      onAdd={handleAddWant}
                      showAddButton
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 