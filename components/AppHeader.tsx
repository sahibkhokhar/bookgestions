'use client';

import Link from 'next/link';
import { BookOpen, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function AppHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: '/search', label: 'Search' },
    { href: '/library', label: 'Library' },
    { href: '/want-to-read', label: 'Want to Read' },
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: logo + nav */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-white">
            <BookOpen className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-bold">Bookgestions</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'text-sm hover:text-white transition-colors',
                  pathname.startsWith(item.href)
                    ? 'text-white font-semibold'
                    : 'text-gray-400'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: auth & tagline */}
        <div className="hidden md:flex items-center space-x-4 text-xs text-gray-400">
          <span className="hidden lg:inline">Find books you love, get AI recommendations</span>
          {status === 'authenticated' && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 