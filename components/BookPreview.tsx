'use client';

import { BookDetails } from '@/types';
import { formatAuthors } from '@/lib/utils';
import { truncateText } from '@/lib/utils';
import Image from 'next/image';

interface BookPreviewProps {
  book: BookDetails;
}

export default function BookPreview({ book }: BookPreviewProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Cover Image */}
      <div className="flex justify-center">
        <div className="w-48 h-72 bg-gray-700 rounded-lg overflow-hidden shadow-lg">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              width={192}
              height={288}
              unoptimized
              className="w-full h-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-sm">No Cover Available</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Book Information */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight mb-2">
            {book.title}
          </h2>
          <p className="text-lg text-gray-300">
            {formatAuthors(book.authors)}
          </p>
        </div>

        {/* Publication Year */}
        {book.publishYear && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span className="font-medium">Published:</span>
            <span>{book.publishYear}</span>
          </div>
        )}

        {/* Publishers */}
        {book.publishers && book.publishers.length > 0 && (
          <div className="text-sm text-gray-400">
            <span className="font-medium">Publisher:</span>
            <span className="ml-2">{book.publishers[0]}</span>
          </div>
        )}

        {/* ISBN */}
        {book.isbn && (
          <div className="text-sm text-gray-400">
            <span className="font-medium">ISBN:</span>
            <span className="ml-2 font-mono">{book.isbn}</span>
          </div>
        )}

        {/* Subjects/Genres */}
        {book.subjects && book.subjects.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Subjects:</h3>
            <div className="flex flex-wrap gap-2">
              {book.subjects.slice(0, 6).map((subject, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                >
                  {subject}
                </span>
              ))}
              {book.subjects.length > 6 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  +{book.subjects.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Short Description */}
        {book.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Summary:</h3>
            <p className="text-sm text-gray-400">
              {truncateText(book.description, 200)}
            </p>
          </div>
        )}

        {/* AI Reason */}
        {'reason' in book && book.reason && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Why recommended:</h3>
            <p className="text-sm text-gray-400 italic">{book.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
} 