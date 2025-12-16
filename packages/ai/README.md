# @tailgrid/ai

AI query parsing for TailGrid - convert natural language to filters and sorting.

## Installation

```bash
npm install @tailgrid/ai
# or
pnpm add @tailgrid/ai
```

## Quick Start

```typescript
import { createAIProvider } from '@tailgrid/ai';

// Create provider
const ai = createAIProvider('openai', {
  apiKey: process.env.OPENAI_API_KEY,
});

// Define your column schema
const schema = [
  { id: 'name', name: 'Name', type: 'string' },
  { id: 'email', name: 'Email', type: 'string' },
  { id: 'age', name: 'Age', type: 'number' },
  { id: 'createdAt', name: 'Created Date', type: 'date' },
];

// Parse natural language query
const result = await ai.parseQuery(
  'show users older than 25 sorted by name',
  schema
);

console.log(result);
// {
//   filters: [{ id: 'age', operator: 'gt', value: 25 }],
//   sorting: [{ id: 'name', desc: false }],
//   confidence: 0.95,
//   query: 'show users older than 25 sorted by name'
// }
```

## Supported Providers

### OpenAI

```typescript
import { createOpenAIProvider } from '@tailgrid/ai';

const provider = createOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini', // default
});
```

### Anthropic (Claude)

```typescript
import { createAnthropicProvider } from '@tailgrid/ai';

const provider = createAnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-haiku-20240307', // default
});
```

### Ollama (Local LLM)

```typescript
import { createOllamaProvider } from '@tailgrid/ai';

const provider = createOllamaProvider({
  endpoint: 'http://localhost:11434', // default
  model: 'llama3',
});
```

### Custom Provider

```typescript
import { createCustomProvider } from '@tailgrid/ai';

const provider = createCustomProvider({
  endpoint: 'https://my-api.com/ai',
  headers: { 'Authorization': 'Bearer xxx' },
  transformRequest: (system, user) => ({
    prompt: `${system}\n\nUser: ${user}`,
  }),
  transformResponse: (res) => res.output,
});
```

## Using with TailGrid React

```tsx
import { TailGrid } from '@tailgrid/react';
import { createOpenAIProvider } from '@tailgrid/ai';

const aiProvider = createOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
});

function App() {
  const [aiQuery, setAiQuery] = useState('');
  const [filters, setFilters] = useState([]);

  const handleAIQuery = async () => {
    const result = await aiProvider.parseQuery(aiQuery, schema);
    if (result.confidence > 0.7) {
      setFilters(result.filters);
    }
  };

  return (
    <div>
      <input
        placeholder="Ask AI: e.g., 'users in California'"
        value={aiQuery}
        onChange={(e) => setAiQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
      />

      <TailGrid
        data={users}
        columns={columns}
        initialFilters={{ columnFilters: filters }}
      />
    </div>
  );
}
```

## Column Schema

Define your columns for better AI understanding:

```typescript
const schema = [
  {
    id: 'name',
    name: 'Customer Name',
    type: 'string',
    description: 'Full name of the customer',
  },
  {
    id: 'revenue',
    name: 'Revenue',
    type: 'currency',
    description: 'Total revenue in USD',
    examples: ['$1,000', '$50,000'],
  },
  {
    id: 'status',
    name: 'Status',
    type: 'string',
    examples: ['active', 'inactive', 'pending'],
  },
  {
    id: 'createdAt',
    name: 'Created Date',
    type: 'date',
    description: 'When the customer was added',
  },
];
```

## Supported Filter Operators

| Operator | Description | Types |
|----------|-------------|-------|
| `equals` | Exact match | All |
| `notEquals` | Not equal | All |
| `contains` | Contains substring | String |
| `startsWith` | Starts with | String |
| `endsWith` | Ends with | String |
| `gt` | Greater than | Number, Date |
| `gte` | Greater than or equal | Number, Date |
| `lt` | Less than | Number, Date |
| `lte` | Less than or equal | Number, Date |
| `between` | Between two values | Number, Date |
| `inList` | Value in list | All |
| `isEmpty` | Is empty/null | All |
| `isNotEmpty` | Is not empty | All |

## Error Handling

```typescript
const result = await provider.parseQuery(query, schema);

if (result.error) {
  console.error('Parse failed:', result.error);
  return;
}

if (result.confidence < 0.7) {
  console.warn('Low confidence, query may be ambiguous');
}

// Use result.filters and result.sorting
```

## License

MIT - Part of the [TailGrid](https://tailgrid.dev) project.
