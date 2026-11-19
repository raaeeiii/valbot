export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'INVALID_JSON', message: 'Malformed JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'INVALID_PAYLOAD', message: 'Request body must be an object' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, model } = body as { messages?: unknown; model?: unknown };

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PAYLOAD', message: 'A non-empty messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: 'PAYLOAD_TOO_LARGE', message: 'Maximum 50 messages allowed per conversation request' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const allowedRoles = new Set(['user', 'assistant', 'system']);
    let totalLength = 0;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg || typeof msg !== 'object') {
        return new Response(
          JSON.stringify({ error: 'INVALID_MESSAGE', message: `Message at index ${i} is invalid` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!allowedRoles.has(msg.role)) {
        return new Response(
          JSON.stringify({ error: 'INVALID_ROLE', message: `Invalid role "${msg.role}" at index ${i}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (typeof msg.content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'INVALID_CONTENT', message: `Message content at index ${i} must be a string` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const trimmed = msg.content.trim();
      if (trimmed.length === 0) {
        return new Response(
          JSON.stringify({ error: 'EMPTY_CONTENT', message: `Message content at index ${i} cannot be empty` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (msg.content.length > 4000) {
        return new Response(
          JSON.stringify({ error: 'MESSAGE_TOO_LONG', message: `Message at index ${i} exceeds maximum limit of 4000 characters` }),
          { status: 413, headers: { 'Content-Type': 'application/json' } }
        );
      }

      totalLength += msg.content.length;
    }

    if (totalLength > 10000) {
      return new Response(
        JSON.stringify({ error: 'PAYLOAD_TOO_LARGE', message: 'Combined message content exceeds total limit of 10000 characters' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // -----------------------------------------------------
    // MOCK QUOTA TEST (Guarded: Dev or explicit test flag only)
    // -----------------------------------------------------
    const isDevOrTest = process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_QUOTA === 'true';
    const lastMessage = messages[messages.length - 1]?.content || '';
    if (isDevOrTest && lastMessage.trim() === 'TEST_QUOTA_ERROR') {
      return new Response(
        JSON.stringify({
          error: 'QUOTA_EXHAUSTED',
          message: 'Mock quota exhaustion triggered for testing.'
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const rawKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.VITE_OPENROUTER_API_KEY ||
      process.env.OPENROUTER_KEY ||
      '';
    const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, '');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'SERVER_MISCONFIGURED', message: 'Server misconfiguration: API key missing' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Model whitelist: Google (Gemma / Gemini) and Meta (Llama) free models
    const ALLOWED_MODELS = new Set([
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'google/gemma-3-27b-it:free',
      'google/gemini-2.0-flash-exp:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'openrouter/free'
    ]);
    const targetModel = typeof model === 'string' && ALLOWED_MODELS.has(model)
      ? model
      : 'google/gemma-4-31b-it:free';

    // Automatic fallback chain if selected model experiences 404/429/503 or provider error
    const FALLBACK_MODELS = [
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'openrouter/free'
    ];

    const modelsToTry = [
      targetModel,
      ...FALLBACK_MODELS.filter(m => m !== targetModel)
    ];

    // Sanitize messages for OpenRouter
    const sanitizedMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    let lastErrorStatus = 502;
    let lastErrorMessage = '';
    let isQuotaError = false;

    // Try primary model and fall back to alternative free models if error occurs
    for (const currentModel of modelsToTry) {
      try {
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://valbot.vercel.app',
            'X-Title': 'ValBot',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: sanitizedMessages,
          })
        });

        if (openRouterResponse.ok) {
          const data = await openRouterResponse.json();
          const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

          return new Response(JSON.stringify({ reply, model: currentModel }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        lastErrorStatus = openRouterResponse.status;
        const errorData = await openRouterResponse.json().catch(() => ({}));
        lastErrorMessage = errorData.error?.message || errorData.message || `Provider returned ${openRouterResponse.status}`;

        if (openRouterResponse.status === 429) {
          const lower = lastErrorMessage.toLowerCase();
          if (
            lower.includes('quota') ||
            lower.includes('credit') ||
            lower.includes('balance') ||
            lower.includes('limit reached')
          ) {
            isQuotaError = true;
          }
        }

        console.warn(`[ValBot AI] Model "${currentModel}" returned ${openRouterResponse.status}: ${lastErrorMessage}. Trying fallback...`);
      } catch (fetchErr: unknown) {
        lastErrorMessage = fetchErr instanceof Error ? fetchErr.message : 'Network error';
        console.warn(`[ValBot AI] Connection error for model "${currentModel}":`, fetchErr);
      }
    }

    if (lastErrorStatus === 429) {
      if (isQuotaError) {
        return new Response(JSON.stringify({
          error: 'QUOTA_EXHAUSTED',
          message: 'Provider daily limit exhausted'
        }), { status: 429, headers: { 'Content-Type': 'application/json' } });
      } else {
        return new Response(JSON.stringify({
          error: 'RATE_LIMITED',
          message: 'Too many requests to provider. Please try again in a moment.'
        }), { status: 429, headers: { 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({
      error: 'PROVIDER_ERROR',
      message: `Upstream AI provider error: ${lastErrorMessage || lastErrorStatus}`
    }), { status: 502, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('API Chat Error:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
