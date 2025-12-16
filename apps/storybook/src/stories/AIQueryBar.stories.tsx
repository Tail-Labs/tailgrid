import type { Meta, StoryObj } from '@storybook/react';
import { AIQueryBar } from '@tailgrid/react';
import { defaultClassNames } from '@tailgrid/react';
import { useState } from 'react';

const meta: Meta<typeof AIQueryBar> = {
  title: 'Components/AIQueryBar',
  component: AIQueryBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'AI-powered natural language query bar for filtering and sorting data.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default AI Query Bar
 */
export const Default: Story = {
  args: {
    classNames: defaultClassNames,
    placeholder: 'Ask a question about your data...',
    onQuery: async (query) => {
      console.log('Query:', query);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        query,
        confidence: 0.95,
        filters: [],
      };
    },
  },
};

/**
 * AI Query Bar with loading state
 */
export const Loading: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
      <AIQueryBar
        classNames={defaultClassNames}
        placeholder="Try: 'Show me active users'"
        loading={isLoading}
        onQuery={async (query) => {
          setIsLoading(true);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setIsLoading(false);
          return { query, confidence: 0.9, filters: [] };
        }}
      />
    );
  },
};

/**
 * AI Query Bar with error state
 */
export const WithError: Story = {
  args: {
    classNames: defaultClassNames,
    placeholder: 'Ask a question...',
    error: 'Failed to process query. Please try again.',
    onQuery: async () => ({ query: '', confidence: 0, filters: [] }),
  },
};

/**
 * AI Query Bar with suggestions
 */
export const WithSuggestions: Story = {
  args: {
    classNames: defaultClassNames,
    placeholder: 'Ask a question...',
    suggestions: [
      'Show users with salary > $70,000',
      'Filter by active status',
      'Sort by name ascending',
      'Show admins only',
    ],
    onQuery: async (query) => ({ query, confidence: 0.85, filters: [] }),
  },
};

/**
 * AI Query Bar with keyboard shortcut hint
 */
export const WithShortcutHint: Story = {
  args: {
    classNames: defaultClassNames,
    placeholder: 'Press ⌘K to search...',
    shortcut: 'mod+k',
    onQuery: async (query) => ({ query, confidence: 0.95, filters: [] }),
  },
};
