import React, { useState } from 'react';
import { Search, ExternalLink, Calendar, AlertCircle, Loader2 } from 'lucide-react';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('UAP sightings');

  const searchNews = async (query) => {
    setLoading(true);
    setError('');
    setArticles([]);

    try {
      const response = await fetch('https://ufonews.netlify.app/.netlify/functions/search-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      
      let resultText = '';
      
      if (data.content && Array.isArray(data.content)) {
        for (const block of data.content) {
          if (block.type === 'text') {
            resultText += block.text;
          }
        }
      } else if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      } else {
        if (Array.isArray(data)) {
          setArticles(data);
          return;
        }
        throw new Error('Unexpected response format');
      }

      const jsonMatch = resultText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setArticles(parsed);
      } else {
        setError('Unable to parse news results. Please try again.');
      }
    } catch (err) {
      setError(`Failed to fetch news: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchNews(searchTerm);
    }
  };

  const quickSearches = [
    'Recent UFO sightings',
    'UAP government reports',
    'Pentagon UFO disclosure',
    'UFO encounters 2026'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      {/* Header Navigation Bar */}
      <nav className="bg-indigo-700/50 backdrop-blur-sm border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">UFO News Aggregator</h1>
              <p className="text-indigo-200 text-sm">ADI INFOCON INTELLIGENCE PLATFORM</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="https://adiinfocon.com" className="text-indigo-200 hover:text-white transition-colors">
                Home
              </a>
              <a href="https://adiinfocon.com/uap/" className="text-indigo-200 hover:text-white transition-colors">
                UAP Knowledge Graph
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4">
        {/* Hero Section */}
        <div className="text-center mb-8 pt-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-5xl font-bold text-white mb-2">Real-time UAP News</h2>
            </div>
          </div>
          <p className="text-indigo-200 text-lg mb-4">
            AI-powered aggregation of UFO and UAP sightings from around the world
          </p>
          <div className="inline-block bg-indigo-600/30 border border-indigo-400/40 rounded-lg px-4 py-2">
            <a 
              href="https://adiinfocon.com/uap/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-100 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span>🗺️ Explore our UAP Knowledge Graph - 146,400+ historical events</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-indigo-400/30">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-indigo-300" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchTerm.trim() && searchNews(searchTerm)}
                placeholder="Search for UFO/UAP news..."
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-indigo-400/30 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400 focus:bg-white/30 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              Search
            </button>
          </div>
        </div>

        {/* Quick Search Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {quickSearches.map((term, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchTerm(term);
                searchNews(term);
              }}
              className="px-5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-100 rounded-full text-sm font-medium transition-all hover:scale-105"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/40 rounded-lg flex items-center gap-3 text-red-200">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="animate-spin mx-auto mb-4 text-indigo-400" size={56} />
            <p className="text-indigo-200 text-lg">Searching for the latest UFO news...</p>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid gap-4">
            {articles.map((article, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm border border-indigo-400/30 rounded-xl p-6 hover:bg-white/15 transition-all hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-semibold text-white flex-1">
                    {article.title}
                  </h3>
                  <ExternalLink className="text-indigo-300 flex-shrink-0" size={20} />
                </div>
                
                <p className="text-indigo-100 mb-4 leading-relaxed">
                  {article.summary}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-indigo-300">
                  <span className="font-semibold">{article.source}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {article.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && !error && (
          <div className="text-center py-16 text-indigo-200">
            <div className="w-28 h-28 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-indigo-400/40">
              <Search size={48} className="text-indigo-300" />
            </div>
            <p className="text-xl font-semibold mb-2">Search for UFO and UAP news to get started</p>
            <p className="text-sm text-indigo-300 mb-4">Try one of the quick search options above</p>
            <a 
              href="https://adiinfocon.com/uap/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-sm underline"
            >
              Or explore 146,400+ historical UAP events in our Knowledge Graph
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-indigo-400/20 text-center pb-8">
          <p className="text-indigo-200 font-semibold mb-2">
            © {new Date().getFullYear()} ADI Infocon LLC. All rights reserved.
          </p>
          <p className="text-indigo-300 text-sm mb-4">
            Expert Technology Consulting | Cloud Computing, AI, and Cybersecurity
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-indigo-300">
            <a href="https://adiinfocon.com" className="hover:text-white transition-colors font-medium">
              Home
            </a>
            <span>•</span>
            <a href="https://adiinfocon.com/uap/" className="hover:text-white transition-colors font-medium">
              UAP Knowledge Graph
            </a>
            <span>•</span>
            <a href="https://adiinfocon.com/contact" className="hover:text-white transition-colors font-medium">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
