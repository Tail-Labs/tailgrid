# TailGrid Example App

Interactive demo application showcasing TailGrid features.

## Features Demonstrated

- **Sorting** - Click column headers to sort
- **Filtering** - Global and per-column filtering
- **Pagination** - Navigate through pages
- **Row Selection** - Select individual or all rows
- **Virtual Scrolling** - Handle 10k+ rows efficiently

## Running the Example

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Build packages first
pnpm run build

# Run the example app
pnpm --filter @tailgrid/example run dev
```

Then open http://localhost:5173 in your browser.

## Code Structure

- `src/App.tsx` - Main demo component with toggleable features
- `src/data.ts` - Sample data generation utilities
- `src/index.css` - Demo styling

## Customization

Toggle features using the checkboxes at the top of the demo. The app demonstrates:

1. **100 rows** by default with pagination
2. **10,000 rows** when virtual scrolling is enabled

This showcases TailGrid's ability to handle large datasets without performance degradation.
