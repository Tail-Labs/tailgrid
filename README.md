# TailGrid

> The AI-native data grid for modern web apps

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@tailgrid/react.svg)](https://www.npmjs.com/package/@tailgrid/react)

TailGrid is an open-source, AI-powered data grid component that offers **natural language querying**, smart filtering, and modern developer experience.

## Features

- **AI-Powered Filtering** - Query your data with natural language ("show customers in California with revenue > 10k")
- **Multi-Provider AI** - Works with OpenAI, Anthropic (Claude), Ollama (local), or custom endpoints
- **Built on TanStack Table** - Battle-tested table logic with our own UI layer
- **Framework Agnostic Core** - React first, Vue/Svelte adapters coming soon
- **Full Feature Set** - Sorting, filtering, pagination, selection, resizing
- **TypeScript First** - Full type safety out of the box
- **MIT Licensed** - Free and open source

## Quick Start

```bash
npm install @tailgrid/react
```

```tsx
import { TailGrid } from '@tailgrid/react';

const columns = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'email', header: 'Email', accessorKey: 'email' },
  { id: 'role', header: 'Role', accessorKey: 'role' },
];

function App() {
  return (
    <TailGrid
      data={users}
      columns={columns}
      enableSorting
      enableFiltering
      enablePagination
    />
  );
}
```

## With AI Query

```tsx
import { TailGrid } from '@tailgrid/react';
import { createOpenAIProvider } from '@tailgrid/ai';

const aiProvider = createOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
});

// User types: "show active customers sorted by name"
// AI converts to: filters + sorting
const result = await aiProvider.parseQuery(query, columnSchema);
```

## Packages

| Package | Description |
|---------|-------------|
| [@tailgrid/core](./packages/core) | Framework-agnostic core (sorting, filtering, pagination) |
| [@tailgrid/react](./packages/react) | React components and hooks |
| [@tailgrid/ai](./packages/ai) | AI query parsing (OpenAI, Claude, Ollama) |
| @tailgrid/themes | Pre-built themes (coming soon) |

## Documentation

Visit [tailgrid.dev](https://tailgrid.dev) for full documentation.

- [Getting Started](https://tailgrid.dev/docs/getting-started)
- [API Reference](https://tailgrid.dev/docs/api)
- [AI Features](https://tailgrid.dev/docs/ai)
- [Examples](https://tailgrid.dev/examples)

## Development

```bash
# Clone the repo
git clone https://github.com/Tail-Labs/tailgrid.git
cd tailgrid

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development
pnpm dev

# Run tests
pnpm test
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Part of TailLabs

TailGrid is the open-source foundation of the [TailLabs](https://taillabs.io) ecosystem:

- **TailCRM** - Modern CRM built with TailGrid
- **TailForms** - Form builder with TailGrid data tables
- **TailOps** - Service operations platform

## License

MIT © [TailLabs](https://taillabs.io)

---

<p align="center">
  <a href="https://tailgrid.dev">Website</a> •
  <a href="https://tailgrid.dev/docs">Docs</a> •
  <a href="https://github.com/Tail-Labs/tailgrid/issues">Issues</a>
</p>
