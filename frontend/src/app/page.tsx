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
  { name: 'iPhone 16 Pro Max', icon: '📱' },
  { name: 'Asus ROG Zephyrus', icon: '💻' },
  { name: 'AirPods Pro 2', icon: '🎧' },
  { name: 'Samsung S24 Ultra', icon: '✨' },
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
        console.error("Geo-IP router offline, defaulting natively to BD index.", e);
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
      // ⚠️ REPLACE WITH YOUR ACTUAL LIVE RENDER SERVER DOMAIN LINK URL
      const BACKEND_URL = "https://onrender.com"; 
      const res = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(searchQuery)}`);
      const payload = await res.json();
      
      const finalData = payload.results || payload.data || [];
      setResults(finalData);
    } catch (error) {
      console.error("Network fetch data matrix sync failed", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col font-sans p-6 selection:bg-slate-900 selection:text-white">
      
      {/* Top Floating Control Nav Bar */}
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center mb-16">
        <div className="font-black text-xl tracking-tighter cursor-pointer" onClick={() => { setSearched(false); setQuery(''); setResults([]); }}>
          COMPARE<span className="text-blue-600">.LIVE</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-100 transition shadow-sm">
            📍 {currentCountry.name} <span className="text-[10px] text-slate-400">▼</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 z-50">
              {COUNTRIES.map((c) => (
                <button key={c.code} onClick={() => { setCurrentCountry(c); setShowDropdown(false); setResults([]); setSearched(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between ${currentCountry.code === c.code ? 'bg-slate-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'}`}>
                  <span>{c.name}</span>
                  {!c.supported && <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase">Soon</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Focus Control Search Deck Block */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto">
        {!searched && (
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">Search globally. Buy locally.</h1>
            <p className="text-slate-400 text-sm font-medium">Type any gadget or choose a tile below to compare prices live.</p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); executeSearch(query); }} className="w-full relative flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-100 focus-within:border-slate-400 transition-all duration-300">
          <input type="text" placeholder={`Search anything in ${currentCountry.name}...`} value={query} onChange={(e) => setQuery(e.target.value)} disabled={loading} className="w-full pl-4 pr-12 py-3 bg-transparent outline-none border-0 text-slate-900 font-medium placeholder-slate-400 text-base" />
          <button type="submit" disabled={loading || !query.trim()} className="absolute right-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition disabled:opacity-40">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
        </form>

        {/* Output & Discovery Canvas Panel Area */}
        <div className="w-full mt-10">
          
          {/* Trending Interest Tiles Discovery Block */}
          {!searched && !loading && currentCountry.supported && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">Trending Interests</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRENDING_PRODUCTS.map((p) => (
                  <div key={p.name} onClick={() => { setQuery(p.name); executeSearch(p.name); }} className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-md hover:border-slate-300 active:scale-95">
                    <span className="text-2xl mb-2">{p.icon}</span>
                    <span className="text-xs font-bold text-slate-700 truncate w-full">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* International Coming Soon Shield Layer */}
          {!currentCountry.supported && query && (
            <div className="text-center py-12 px-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-2xl">🚀</span>
              <h3 className="font-extrabold text-slate-800 text-lg mt-2">Launching in {currentCountry.name} very soon.</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">We are configuring live asynchronous web spiders for your region's marketplaces right now.</p>
            </div>
          )}

          {/* Shimmer Layout Loader Matrix */}
          {loading && currentCountry.supported && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-50 border border-slate-100 rounded-xl w-full"></div>
              ))}
            </div>
          )}

          {/* Render Blank Slate Response Fallback */}
          {!loading && searched && results.length === 0 && currentCountry.supported && (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400 font-medium text-sm">
              🔍 No live store items match your query. Try adjusting your search keywords.
            </div>
          )}

          {/* Sorted Pricing Results Dashboard Grid Map */}
          {!loading && searched && results.length > 0 && currentCountry.supported && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Live Scraped Options</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Sorted: Low to High Base Price</span>
              </div>
              {results.map((product, index) => (
                <div key={index} className={`bg-white rounded-xl p-4 border flex items-center justify-between gap-4 transition hover:shadow-sm ${index === 0 ? 'border-emerald-500 ring-4 ring-emerald-500/5 bg-emerald-50/5' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={product.image_url || "https://placehold.co"} alt={product.product_name} className="w-12 h-12 object-contain bg-slate-50 border rounded-lg p-0.5 flex-shrink-0" onerror={(e:any)=>{e.target.src="https://placehold.co"}} />
                    <div className="min-w-0">
                      {index === 0 && <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide inline-block mb-1">Cheapest Match</span>}
                      <h3 className="font-bold text-slate-800 text-sm truncate">{product.product_name}</h3>
                      <p className="text-[11px] text-slate-400 font-bold">{product.shop_name} • <span className="text-emerald-600">{product.availability}</span></p>
                    </div>
                  </div>
{product.price.toLocaleString()} {currentCountry.currency}

Go →


))}

)}



);
}
