// netlify/functions/search-news.js
const fetch = require('node-fetch');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type':                 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON' }) }; }

  // Build a clean, minimal Anthropic payload — no extra fields that cause 400s
  let payload;

  if (body.messages) {
    // Media finder path — client sends full payload
    payload = {
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages:   body.messages,
    };
    // Only add system if it's a non-empty plain string
    if (typeof body.system === 'string' && body.system.trim()) {
      payload.system = body.system;
    }
    // Only add tools with exactly type+name — strip any extra fields like blocked_domains
    if (Array.isArray(body.tools) && body.tools.length) {
      payload.tools = body.tools.map(function(t) {
        return { type: t.type, name: t.name };
      });
    }
  } else {
    // News aggregator legacy path — client sends { query }
    payload = {
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: body.query || 'latest UAP UFO news 2025' }],
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
    };
  }

  console.log('Anthropic payload:', JSON.stringify(payload).substring(0, 400));

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta':    'web-search-2025-03-05',
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      const msg = (data.error && data.error.message) ? data.error.message : JSON.stringify(data);
      console.error('Anthropic error', resp.status, msg);
      return { statusCode: resp.status, headers: CORS, body: JSON.stringify({ error: msg }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
