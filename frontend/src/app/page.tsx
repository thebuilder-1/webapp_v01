'use client';

import { useState, useEffect } from 'react';

interface ProductResult {
  shop_name: string;
  product_name: string;
  price: number;
  product_url: string;
  image_url: string;
  availability: string;
}

const COUNTRIES = [
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', supported: true },
  { code: 'US', name: 'United States', currency: 'USD', supported: false },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', supported: false },
  { code: 'IN', name: 'India', currency: 'INR', supported: false },
];

const TRENDING_PRODUCTS = [
  { name: 'iPhone 16 Pro Max', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop' },
  { name: 'Samsung S24 Ultra', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop' },
  { name: 'MacBook Air M3', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop' },
  { name: 'AirPods Pro 2', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&h=200&fit=crop' },
];

export default function Home() {
  const [currentCountry, setCurrentCountry] = useState(COUNTRIES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function autoDetectGeo() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const matched = COUNTRIES.find((c) => c.code === data.country_code);
        if (matched) setCurrentCountry(matched);
      } catch (e) {
        // default stays Bangladesh
      }
    }
    autoDetectGeo();
  }, []);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !currentCountry.supported) return;

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      // ⚠️ Replace with your real Render backend URL
      const BACKEND_URL = 'https://compare-live-backend.onrender.com';
      const res = await fetch(
        `${BACKEND_URL}/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      const payload = await res.json();
      const finalData = payload.results || payload.data || [];
      setResults(finalData);
    } catch (error) {
      console.error('Search failed', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleTileClick = (productName: string) => {
    setQuery(productName);
    executeSearch(productName);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <nav className="w-full max-w-4xl mx-auto px-6 pt-6 flex justify-between items-center z-50">
        <div
          className="font-black text-xl tracking-tighter text-slate-900 cursor-pointer"
          onClick={() => {
            setSearched(false);
            setQuery('');
            setResults([]);
          }}
        >
          COMPARE<span className="text-blue-600">.LIVE</span>
        </div>

        {/* Country Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-100 transition shadow-sm"
          >
            <span>📍 {currentCountry.name}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 z-50">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setCurrentCountry(country);
                    setShowDropdown(false);
                    setResults([]);
                    setSearched(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition ${
                    currentCountry.code === country.code
                      ? 'bg-slate-50 text-blue-600'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{country.name}</span>
                  {!country.supported && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-6 py-12">
        {!searched && (
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
              Search globally. Buy locally.
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Type any product to compare live prices across local stores.
            </p>
          </div>
        )}

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full relative flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-100 focus-within:border-slate-400 transition-all"
        >
          <input
            type="text"
            placeholder={`Search anything in ${currentCountry.name}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-14 py-3 bg-transparent border-0 outline-none text-slate-900 font-medium placeholder-slate-400 text-base"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition disabled:opacity-40"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>

        {/* Results / Trending / Loading */}
        <div className="w-full mt-10">
          {/* Trending Interests */}
          {!searched && !loading && currentCountry.supported && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
                Trending Interests
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRENDING_PRODUCTS.map((product) => (
                  <div
                    key={product.name}
                    onClick={() => handleTileClick(product.name)}
                    className="group bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-md hover:border-slate-300 active:scale-95"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg mb-2 opacity-80 group-hover:opacity-100 transition"
                    />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 truncate w-full">
                      {product.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unsupported Country */}
          {!currentCountry.supported && query && (
            <div className="text-center py-12 px-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <h3 className="font-extrabold text-slate-800 text-lg mt-2">
                We are coming to {currentCountry.name} very soon.
              </h3>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                We are building live price engines for your local stores right now.
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && currentCountry.supported && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-slate-50 border border-slate-100 rounded-xl w-full animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty Results */}
          {!loading && searched && results.length === 0 && currentCountry.supported && (
            <div className="text-center py-12 text-slate-400 font-medium">
              No live offers found. Try a different search term.
            </div>
          )}

          {/* Results List */}
          {!loading && searched && results.length > 0 && currentCountry.supported && (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Live Store Offers
                </span>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                  Sorted: Low → High
                </span>
              </div>

              {results.map((product, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-4 border flex items-center justify-between gap-4 transition hover:shadow-sm ${
                    index === 0
                      ? 'border-emerald-500 ring-4 ring-emerald-500/5 bg-emerald-50/5'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-12 h-12 object-contain flex-shrink-0 bg-slate-50 border rounded-lg p-0.5"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      {index === 0 && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide inline-block mb-1">
                          Cheapest
                        </span>
                      )}
                      <h3 className="font-bold text-slate-800 text-sm truncate">
                        {product.product_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-bold">
                        {product.shop_name} •{' '}
                        <span className="text-emerald-600">{product.availability}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">
                        {product.price.toLocaleString()}{' '}
                        <span className="text-xs font-bold text-slate-500">
                          {currentCountry.currency}
                        </span>
                      </p>
                    </div>
                    <a
                      href={product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                    >
                      Go →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
