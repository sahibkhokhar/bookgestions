'use client';

import { useState } from 'react';
import { BookOpen, Sparkles, Target, Users } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';

export default function LandingPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { status } = useSession();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signIn('discord', { callbackUrl: '/search' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="relative px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-12 w-12 text-primary-500" />
                  <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                    Bookgestions
                  </h1>
                </div>
              </div>
              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                Discover your next favorite book with AI-powered recommendations.
                Tell us what you love to read, and we'll find books that perfectly
                match your taste using advanced AI and real-time web insights.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="rounded-md bg-primary-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    'Sign In to Get Started'
                  )}
                </button>
                <a
                  href="#features"
                  className="text-lg font-semibold leading-6 text-gray-300 hover:text-white transition-colors"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-400">
              Smarter Recommendations
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to find your next great read
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Our AI analyzes current book trends, reader reviews, and literary connections
              to suggest books you'll truly love.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <Sparkles className="h-5 w-5 flex-none text-primary-400" />
                  AI-Powered Analysis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Our advanced AI analyzes your reading preferences and searches
                    the web for the latest book discussions, reviews, and recommendations.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <Target className="h-5 w-5 flex-none text-primary-400" />
                  Personalized Results
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Get five carefully curated book suggestions that match your taste,
                    complete with detailed information and cover images.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <Users className="h-5 w-5 flex-none text-primary-400" />
                  Community Insights
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Recommendations based on real-time community discussions,
                    book blogs, and current literary conversations.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary-500" />
              <span className="text-sm text-gray-400">Bookgestions</span>
            </div>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2025 Bookgestions. Discover your next favorite book.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}