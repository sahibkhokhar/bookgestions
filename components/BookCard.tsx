'use client';

import { BookDetails } from '@/types';
import { formatAuthors, truncateText } from '@/lib/utils';
import { Plus, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface BookCardProps {
  book: BookDetails;
  onAdd?: (book: BookDetails) => void;
  onRemove?: (bookKey: string) => void;
  onPreview?: (book: BookDetails) => void;
  isSelected?: boolean;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  read?: boolean;
  overlayRemove?: boolean;
  onToggleRead?: () => void;
  owned?: boolean;
  extraAction?: React.ReactNode;
}

export default function BookCard({
  book,
  onAdd,
  onRemove,
  onPreview,
  isSelected,
  showAddButton = false,
  showRemoveButton = false,
  size = 'medium',
  read,
  overlayRemove = false,
  onToggleRead,
  owned = false,
  extraAction,
}: BookCardProps) {
  const sizeClasses = {
    small: 'w-full',
    medium: 'w-full',
    large: 'w-full',
  };

  const imageClasses = {
    small: 'h-32 w-24',
    medium: 'h-40 w-28',
    large: 'h-48 w-32',
  };

  const cardClasses = `${sizeClasses[size]} bg-gray-800 rounded-lg shadow-lg border border-gray-700 book-card cursor-pointer ${
    isSelected ? 'ring-2 ring-inset ring-primary-500' : ''
  }`;

  const handleClick = () => {
    if (onPreview) {
      onPreview(book);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(book);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(book.key);
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      style={{ position: 'relative' }}
    >
      {/* Owned badge (top-left) */}
      {owned && !overlayRemove && (
        <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full bg-blue-600 text-white">
          Owned
        </span>
      )}

      {/* Overlay Remove Button */}
      {overlayRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(book.key);
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
          title="Remove from library"
        >
          ×
        </button>
      )}

      {/* Bottom-right controls */}
      {(read !== undefined || extraAction) && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2 flex-row-reverse">
          {/* Read/Unread badge */}
          {read !== undefined && (
            onToggleRead ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRead();
                }}
                className={`text-xs font-semibold px-2 py-1 rounded-full focus:outline-none ${
                  read ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
                title="Toggle read status"
              >
                {read ? 'Read' : 'Unread'}
              </button>
            ) : (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  read ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                }`}
              >
                {read ? 'Read' : 'Unread'}
              </span>
            )
          )}

          {/* Extra action */}
          {extraAction}
        </div>
      )}

      <div className="p-4">
        <div className="flex space-x-4">
          {/* Book Cover */}
          <div className={`${imageClasses[size]} flex-shrink-0 bg-gray-700 rounded overflow-hidden`}>
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                width={size === 'large' ? 128 : size === 'medium' ? 112 : 96}
                height={size === 'large' ? 192 : size === 'medium' ? 160 : 128}
                unoptimized
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-2xl">📚</div>
                  <div className="text-xs mt-1">No Cover</div>
                </div>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className={`flex-1 min-w-0 ${overlayRemove ? 'pr-6' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white leading-tight mb-1">
                  {truncateText(book.title, size === 'small' ? 40 : 60)}
                </h3>
                <p className="text-xs text-gray-400 mb-2">
                  {formatAuthors(book.authors)}
                </p>
                {book.publishYear && (
                  <p className="text-xs text-gray-500">
                    {book.publishYear}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 ml-2">
                {showAddButton && (
                  <button
                    onClick={handleAddClick}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                    title={isSelected ? 'Already selected' : 'Add to selection'}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                )}

                {showRemoveButton && (
                  <button
                    onClick={handleRemoveClick}
                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                    title="Remove from selection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}