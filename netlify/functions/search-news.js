const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Get query from request body
  const { query } = JSON.parse(event.body);

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Query is required' })
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Search for recent news about: ${query}. Find 5-8 recent articles with headlines, brief summaries, and sources. Return ONLY a JSON array with this exact structure, no other text:
[
  {
    "title": "Article headline",
    "summary": "Brief 1-2 sentence summary",
    "source": "Source name",
    "date": "Approximate date like 'January 2026' or 'Recent'"
  }
]`
          }
        ],
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search'
          }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch news', details: error.message })
    };
  }
};
