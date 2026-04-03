const searchNews = async (query) => {
  setLoading(true);
  setError('');
  setArticles([]);

  try {
    // Call Netlify Function instead of API directly
    const response = await fetch('/.netlify/functions/search-news', {
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
    for (const block of data.content) {
      if (block.type === 'text') {
        resultText += block.text;
      }
    }

    const jsonMatch = resultText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      setArticles(parsed);
    } else {
      setError('Unable to parse news results. Please try again.');
    }
  } catch (err) {
    setError('Failed to fetch news. Please try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
