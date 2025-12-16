import { describe, it, expect, vi } from 'vitest';
import { createOpenAIProvider } from '../providers/openai';
import { createAnthropicProvider } from '../providers/anthropic';
import { createOllamaProvider } from '../providers/ollama';
import { createCustomProvider } from '../providers/custom';

describe('AI Providers', () => {
  describe('createOpenAIProvider', () => {
    it('should create an OpenAI provider', () => {
      const provider = createOpenAIProvider({
        apiKey: 'test-key',
      });

      expect(provider).toBeDefined();
      expect(provider.type).toBe('openai');
      expect(typeof provider.parseQuery).toBe('function');
    });

    it('should use custom model if provided', () => {
      const provider = createOpenAIProvider({
        apiKey: 'test-key',
        model: 'gpt-4',
      });

      expect(provider).toBeDefined();
    });
  });

  describe('createAnthropicProvider', () => {
    it('should create an Anthropic provider', () => {
      const provider = createAnthropicProvider({
        apiKey: 'test-key',
      });

      expect(provider).toBeDefined();
      expect(provider.type).toBe('anthropic');
      expect(typeof provider.parseQuery).toBe('function');
    });
  });

  describe('createOllamaProvider', () => {
    it('should create an Ollama provider', () => {
      const provider = createOllamaProvider({
        model: 'llama3',
      });

      expect(provider).toBeDefined();
      expect(provider.type).toBe('ollama');
      expect(typeof provider.parseQuery).toBe('function');
    });

    it('should use custom endpoint if provided', () => {
      const provider = createOllamaProvider({
        model: 'llama3',
        endpoint: 'http://localhost:11434',
      });

      expect(provider).toBeDefined();
    });
  });

  describe('createCustomProvider', () => {
    it('should create a custom provider', () => {
      const provider = createCustomProvider({
        endpoint: 'https://my-api.com/ai',
      });

      expect(provider).toBeDefined();
      expect(provider.type).toBe('custom');
      expect(typeof provider.parseQuery).toBe('function');
    });

    it('should accept custom headers', () => {
      const provider = createCustomProvider({
        endpoint: 'https://my-api.com/ai',
        headers: { Authorization: 'Bearer xxx' },
      });

      expect(provider).toBeDefined();
    });
  });
});

describe('generatePrompt', () => {
  it('should generate a prompt from columns', async () => {
    const { generateUserPrompt } = await import('../generatePrompt');

    const columns = [
      { id: 'name', header: 'Name', dataType: 'string' as const },
      { id: 'age', header: 'Age', dataType: 'number' as const },
    ];

    const prompt = generateUserPrompt('show users over 30');

    expect(prompt).toContain('show users over 30');
  });
});
