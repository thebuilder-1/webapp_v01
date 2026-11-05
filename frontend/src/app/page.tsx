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
  { name: 'iPhone 16 Pro Max', image: 'https://unsplash.com' },
  { name: 'Asus ROG Zephyrus', image: 'https://unsplash.com' },
  { name: 'AirPods Pro 2', image: 'https://unsplash.com' },
  { name: 'Samsung S24 Ultra', image: 'https://unsplash.com' },
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
        const response = await fetch('https://ipapi.co');
        const data = await response.json();
        const matched = COUNTRIES.find(c => c.code === data.country_code);
        if (matched) setCurrentCountry(matched);
      } catch (e) {
        console.error("Geo-IP router offline", e);
      }
    }
    autoDetectGeo();
  }, []);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !currentCountry.supported) return;
    setLoading(true);
    setSearched(true);
    try {
      const BACKEND_URL = "YOUR_RENDER_BACKEND_URL"; 
      const res = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(searchQuery)}`);
      const payload = await res.json();
      setResults(payload.data || []);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col font-sans p-6">
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center mb-12">
        <div className="font-black text-xl tracking-tighter" onClick={() => { setSearched(false); setQuery(''); setResults([]); }}>
          COMPARE<span className="text-blue-600">.LIVE</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="text-xs font-bold bg-slate-50 border px-4 py-2 rounded-full">
            📍 {currentCountry.name} ▼
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50">
              {COUNTRIES.map((c) => (
                <button key={c.code} onClick={() => { setCurrentCountry(c); setShowDropdown(false); setResults([]); setSearched(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex justify-between">
                  <span>{c.name}</span>
                  {!c.supported && <span className="text-[9px] bg-amber-100 px-1 rounded">Soon</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center max-w-xl w-full mx-auto">
        {!searched && (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">Search globally. Buy locally.</h1>
            <p className="text-slate-400 text-sm">Compare live store prices instantly.</p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); executeSearch(query); }} className="w-full relative flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <input type="text" placeholder={`Search anything in ${currentCountry.name}...`} value={query} onChange={(e) => setQuery(e.target.value)} disabled={loading} className="w-full pl-4 pr-12 py-3 bg-transparent outline-none text-base" />
          <button type="submit" disabled={loading || !query.trim()} className="absolute right-2 p-2.5 rounded-xl bg-slate-900 text-white font-bold">🔍</button>
        </form>

        <div className="w-full mt-10">
          {!searched && !loading && currentCountry.supported && (
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Trending Interests</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRENDING_PRODUCTS.map((p) => (
                  <div key={p.name} onClick={() => { setQuery(p.name); executeSearch(p.name); }} className="bg-slate-50 border rounded-xl p-3 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded mb-2" />
                    <span className="text-xs font-bold text-slate-700 truncate w-full">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!currentCountry.supported && query && (
            <div className="text-center py-12 bg-slate-50 border rounded-2xl">
              <span className="text-xl">🚀</span>
              <h3 className="font-bold text-slate-800 mt-2">Launching in {currentCountry.name} soon.</h3>
            </div>
          )}

          {loading && <div className="h-20 bg-slate-50 border rounded-xl w-full animate-pulse"></div>}

          {!loading && searched && results.length > 0 && currentCountry.supported && (
            <div className="space-y-3">
              {results.map((product, index) => (
                <div key={index} className={`bg-white rounded-xl p-4 border flex items-center justify-between gap-4 ${index === 0 ? 'border-emerald-500' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={product.image_url} alt={product.product_name} className="w-12 h-12 object-contain bg-slate-50 border rounded p-0.5" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{product.product_name}</h3>
                      <p className="text-xs text-slate-400">{product.shop_name} • <span className="text-emerald-600">{product.availability}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-black">{product.price.toLocaleString()} <span className="text-xs font-bold">{currentCountry.currency}</span></p>
                    <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg">Go →</a>
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
