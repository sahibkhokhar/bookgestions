'use client';

import { useState, useEffect } from 'react';
import { Search, Bookmark, BookOpen } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useBookSearch } from '@/hooks/useBookSearch';
import { BookDetails, WantToReadEntry, LibraryEntry } from '@/types';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WantToReadAPI, LibraryAPI } from '@/lib/api';
import { useSession, signIn } from 'next-auth/react';

export default function WantToReadPage() {
  const { data: session, status } = useSession();
  const { query, results, loading, updateQuery } = useBookSearch();

  const [list, setList] = useState<WantToReadEntry[]>([]);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [listSearch, setListSearch] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchList();
      LibraryAPI.getLibrary().then(setLibrary).catch(console.error);
    }
  }, [status]);

  const fetchList = async () => {
    const entries = await WantToReadAPI.getList();
    setList(entries);
  };

  const handleAdd = async (book: BookDetails) => {
    const success = await WantToReadAPI.add(book);
    if (success) {
      setList((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          key: book.key,
          title: book.title,
          authors: book.authors.join(', '),
          coverUrl: book.coverUrl,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const removeEntry = async (entry: WantToReadEntry) => {
    await WantToReadAPI.delete(entry.key);
    setList((prev) => prev.filter((e) => e.key !== entry.key));
  };

  const isInList = (key: string) => list.some((e) => e.key === key);
  const isOwned = (key: string) => library.some((e) => e.key === key);

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
        <p>You need to sign in to manage your list.</p>
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
            <span>Find Books to Add</span>
          </h2>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((book) => (
                  <BookCard
                    key={book.key}
                    book={book}
                    onAdd={isInList(book.key) ? undefined : handleAdd}
                    showAddButton
                    isSelected={isInList(book.key)}
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Want to Read List */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Bookmark className="w-6 h-6" />
            <span>Want to Read ({list.length})</span>
          </h2>

          {/* List Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your want-to-read list..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {list.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No books in your list yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {list
                  .filter((e) => {
                    const s = listSearch.trim().toLowerCase();
                    if (!s) return true;
                    return (
                      e.title.toLowerCase().includes(s) ||
                      e.authors.toLowerCase().includes(s)
                    );
                  })
                  .map((entry) => {
                    const owned = isOwned(entry.key);
                    return (
                      <BookCard
                        key={entry.id}
                        book={{
                          key: entry.key,
                          title: entry.title,
                          authors: entry.authors.split(',').map((a) => a.trim()),
                          coverUrl: entry.coverUrl,
                        } as BookDetails}
                        size="small"
                        onRemove={() => removeEntry(entry)}
                        overlayRemove
                        extraAction={owned ? (
                          <BookOpen className="w-5 h-5 text-blue-500" />
                        ) : undefined}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 