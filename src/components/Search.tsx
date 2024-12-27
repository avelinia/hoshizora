import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, Loader2, Film, Tv, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { api } from '../services/api';
import type { SearchResult } from '../types/api';

type SearchState = 'idle' | 'typing' | 'searching' | 'complete';

export function Search() {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSearchState('typing');
    setPage(1);
    setHasMore(false);
  };

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setHasMore(false);
      setSearchState('idle');
      return;
    }

    const performSearch = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setSearchState('searching');
      setResults([]); // Clear previous results when starting new search

      try {
        const data = await api.searchAnime(
          debouncedQuery,
          1,
          abortControllerRef.current.signal
        );
        setResults(data.searchYour);
        setHasMore(data.nextpageavailable);
        setSearchState('complete');
      } catch (error) {
        if (axios.isAxiosError(error) && error.code !== 'ERR_CANCELED') {
          console.error('Search failed:', error);
          setResults([]);
          setHasMore(false);
          setSearchState('complete');
        }
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const loadMore = async () => {
    if (hasMore && searchState !== 'searching') {
      const nextPage = page + 1;
      setPage(nextPage);
      setSearchState('searching');

      try {
        const data = await api.searchAnime(debouncedQuery, nextPage);
        setResults(prev => [...prev, ...data.searchYour]);
        setHasMore(data.nextpageavailable);
      } catch (error) {
        console.error('Failed to load more:', error);
      } finally {
        setSearchState('complete');
      }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      {/* Search Input */}
      <div
        className={`
          h-10 flex items-center gap-3 px-4 transition-all duration-200
          rounded-xl backdrop-blur-sm
          ${isOpen
            ? 'shadow-lg bg-opacity-95'
            : 'bg-opacity-75 hover:bg-opacity-85'
          }
        `}
        style={{
          backgroundColor: currentTheme.colors.background.card,
          boxShadow: isOpen
            ? `0 4px 20px ${currentTheme.colors.background.main}40`
            : 'none'
        }}
      >
        <SearchIcon
          size={18}
          className="flex-shrink-0 transition-colors duration-200"
          style={{
            color: isOpen
              ? currentTheme.colors.accent.primary
              : currentTheme.colors.text.secondary,
          }}
        />
        <input
          type="text"
          placeholder="Search anime... (Press '/' to focus)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder-gray-400"
          style={{
            color: currentTheme.colors.text.primary,
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="p-1.5 rounded-lg hover:bg-black/20 transition-colors flex-shrink-0"
          >
            <X size={16} style={{ color: currentTheme.colors.text.secondary }} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-lg max-h-[70vh] overflow-y-auto custom-scrollbar"
          style={{
            backgroundColor: currentTheme.colors.background.card,
            ['--scrollbar-thumb' as string]: `${currentTheme.colors.accent.primary}40`,
            boxShadow: `0 4px 20px ${currentTheme.colors.background.main}40`
          } as React.CSSProperties}
        >
          {(searchState === 'typing' || searchState === 'searching') ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2
                className="animate-spin"
                size={24}
                style={{ color: currentTheme.colors.accent.primary }}
              />
              <p
                className="text-sm"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                {searchState === 'typing' ? 'Waiting for you to stop typing...' : 'Searching...'}
              </p>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((result) => (
                <div
                  key={result.idanime}
                  className="group relative flex items-center gap-4 p-4 transition-all duration-200 hover:cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.colors.background.card,
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent click
                    navigate(`/anime/${result.idanime}`);
                    setIsOpen(false);
                    setQuery('');
                    setDebouncedQuery('');
                    setResults([]);
                  }}
                >
                  {/* Hover background with rounded corners */}
                  <div
                    className="absolute inset-x-2 inset-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                    style={{ backgroundColor: currentTheme.colors.background.hover }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <div className="relative flex-shrink-0">
                      <img
                        src={result.img}
                        alt={result.name}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                        style={{ backgroundColor: `${currentTheme.colors.background.main}90` }}
                      >
                        {result.format === 'Movie' ? <Film size={24} /> : <Tv size={24} />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium truncate group-hover:text-accent-primary transition-colors duration-200"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        {result.name}
                      </h3>
                      <p
                        className="text-sm truncate"
                        style={{ color: currentTheme.colors.text.secondary }}
                      >
                        {result.jname}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: currentTheme.colors.background.main,
                            color: currentTheme.colors.text.accent
                          }}
                        >
                          {result.format === 'Movie' ? <Film size={12} /> : <Tv size={12} />}
                          {result.format}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: currentTheme.colors.background.main,
                            color: currentTheme.colors.text.accent
                          }}
                        >
                          <Clock size={12} />
                          {result.duration}
                        </span>
                        {result.sub === "1" && (
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: currentTheme.colors.accent.primary,
                              color: currentTheme.colors.background.main
                            }}
                          >
                            SUB
                          </span>
                        )}
                        {result.dubani === "1" && (
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: currentTheme.colors.accent.secondary,
                              color: currentTheme.colors.background.main
                            }}
                          >
                            DUB
                          </span>
                        )}
                      </div>

                      {/* Watch button */}
                      <div
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-200"
                      >
                        <button
                          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                          style={{
                            backgroundColor: currentTheme.colors.accent.primary,
                            color: currentTheme.colors.background.main,
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent click
                            navigate(`/anime/${result.idanime}`);
                            setIsOpen(false);
                            setQuery('');
                            setDebouncedQuery('');
                            setResults([]);
                          }}
                        >
                          <span className="font-medium">Watch</span>
                          <svg
                            className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : searchState === 'complete' && query.trim() ? (
            <div
              className="py-8 text-center"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              No results found for "{query}"
            </div>
          ) : null}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full p-4 text-center transition-colors duration-200 relative group"
              style={{
                backgroundColor: currentTheme.colors.background.card,
                color: currentTheme.colors.text.accent
              }}
              disabled={searchState === 'searching'}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: currentTheme.colors.background.hover }}
              />
              <span className="relative z-10">
                {searchState === 'searching' ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  'Load more results'
                )}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}