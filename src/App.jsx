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

      const response = await fetch('https://ufonews.netlify.app/.netlify/functions/search-news', {
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
        throw new Error('Unexpected response format from API');
      }

      const jsonMatch = resultText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setArticles(parsed);
      } else {
        setError('Unable to parse news results. Please try again.');
      }

    } catch (err) {
      console.error('Search error:', err);
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
          <h1 className="text-4xl font-bold text-white">UFO News Aggregator</h1>
          <p className="text-purple-200">Real-time UAP & UFO news</p>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) =>
              e.key === 'Enter' && searchTerm.trim() && searchNews(searchTerm)
            }
            className="flex-1 p-3 rounded bg-white/10 text-white"
          />
          <button onClick={handleSearch} className="bg-purple-600 px-4 rounded text-white">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>

        {/* Error */}
        {error && <div className="text-red-400">{error}</div>}

        {/* Results */}
        {articles.map((a, i) => (
          <div key={i} className="p-4 border border-purple-500/20 mb-3 rounded">
            <h3 className="text-white">{a.title}</h3>
            <p className="text-gray-300">{a.summary}</p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default App;