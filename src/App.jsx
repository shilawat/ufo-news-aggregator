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
      console.log('Fetching news for:', query);

      const response = await fetch('/.netlify/functions/search-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch news`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Check if data has the expected structure
      let resultText = '';

      if (data.content && Array.isArray(data.content)) {
        console.log('Processing content array...');
        for (const block of data.content) {
          if (block.type === 'text') {
            resultText += block.text;
          }
        }
      } else if (data.error) {
        console.error('API returned error:', data.error);
        console.error('Error details:', JSON.stringify(data.error, null, 2));
        console.error('Full data object:', JSON.stringify(data, null, 2));
        throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      } else {
        // If data is already the articles array
        if (Array.isArray(data)) {
          console.log('Data is already an articles array');
          setArticles(data);
          return;
        }
        console.error('Unexpected response format:', data);
        throw new Error('Unexpected response format from API');
      }

      console.log('Result text:', resultText.substring(0, 200));

      // Extract JSON array from the text
      const jsonMatch = resultText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('Found JSON match, parsing...');
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed articles:', parsed);
        setArticles(parsed);
      } else {
        console.error('No JSON array found in result text');
        setError('Unable to parse news results. Please try again.');
      }
    } catch (err) {
      console.error('Search error details:', {
        message: err.message,
        stack: err.stack,
        error: err,
      });
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
    'UFO encounters 2026',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold text-white">UFO News Aggregator</h1>
          </div>
          <p className="text-purple-200">Real-time UAP & UFO news from around the world</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && searchTerm.trim() && searchNews(searchTerm)
                }
                placeholder="Search for UFO/UAP news..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Search size={20} />
              )}
              Search
            </button>
          </div>
        </div>

        {/* Quick Search Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {quickSearches.map((term, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchTerm(term);
                searchNews(term);
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-200 rounded-full text-sm transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-200">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto mb-4 text-purple-400" size={48} />
            <p className="text-purple-200">Searching for the latest UFO news...</p>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid gap-4">
            {articles.map((article, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-semibold text-white flex-1">{article.title}</h3>
                  <ExternalLink className="text-purple-400 flex-shrink-0" size={20} />
                </div>

                <p className="text-gray-300 mb-4 leading-relaxed">{article.summary}</p>

                <div className="flex items-center gap-4 text-sm text-purple-300">
                  <span className="font-medium">{article.source}</span>
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
          <div className="text-center py-12 text-purple-300">
            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={40} className="text-purple-400" />
            </div>
            <p className="text-lg">Search for UFO and UAP news to get started</p>
            <p className="text-sm mt-2 text-purple-400">
              Try one of the quick search options above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;