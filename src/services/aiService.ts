// AI Service for handling chatbot responses with honest request/response flow & abort support

export interface ChatApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type AIServiceErrorCode = 
  | 'QUOTA_EXHAUSTED'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'INVALID_PAYLOAD'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'ABORTED';

export class AIServiceError extends Error {
  code: AIServiceErrorCode;
  status?: number;

  constructor(message: string, code: AIServiceErrorCode = 'PROVIDER_ERROR', status?: number) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.status = status;
  }
}

export const QUOTA_EXHAUSTED_MESSAGE =
  "We've reached today's free AI limit. Sorry! ValBot's free AI service is temporarily unavailable. Please come back tomorrow. Thank you for your patience!";

export class AIService {
  /**
   * Sends conversation history to the secure /api/chat endpoint.
   * Supports AbortSignal for immediate request cancellation (Stop Generating).
   */
  static async sendMessage(
    messages: ChatApiMessage[], 
    systemPrompt?: string,
    signal?: AbortSignal,
    model?: string
  ): Promise<string> {
    const payloadMessages: ChatApiMessage[] = [];

    if (systemPrompt && systemPrompt.trim()) {
      payloadMessages.push({
        role: 'system',
        content: systemPrompt.trim()
      });
    }

    // Append user & assistant history
    for (const m of messages) {
      if (m.content && m.content.trim()) {
        payloadMessages.push({
          role: m.role,
          content: m.content
        });
      }
    }

    let response: Response;
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: payloadMessages,
          model: model || 'google/gemma-4-31b-it:free'
        }),
        signal
      });
    } catch (networkError: unknown) {
      if (signal?.aborted || (networkError instanceof Error && networkError.name === 'AbortError')) {
        throw new AIServiceError('Generation stopped by user.', 'ABORTED');
      }
      console.error('Network error during AI request:', networkError);
      throw new AIServiceError(
        'Unable to connect to the ValBot server. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }

    let data: { reply?: string; error?: string; message?: string } = {};
    try {
      data = await response.json();
    } catch {
      if (signal?.aborted) {
        throw new AIServiceError('Generation stopped by user.', 'ABORTED');
      }
      throw new AIServiceError('Invalid response from AI server', 'SERVER_ERROR', response.status);
    }

    if (!response.ok) {
      const code: AIServiceErrorCode = data.error === 'QUOTA_EXHAUSTED'
        ? 'QUOTA_EXHAUSTED'
        : data.error === 'RATE_LIMITED' || response.status === 429
        ? 'RATE_LIMITED'
        : 'PROVIDER_ERROR';

      throw new AIServiceError(data.message || 'Failed to fetch AI response', code, response.status);
    }

    if (!data.reply || typeof data.reply !== 'string') {
      throw new AIServiceError('Empty reply received from AI server', 'PROVIDER_ERROR', 200);
    }

    return data.reply;
  }

  // Token estimation helper
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Cost estimation helper (ValBot free tier)
  static estimateCost(text: string): number {
    void text;
    return 0;
  }
}

export default AIService;
