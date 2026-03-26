# src/formatters — Output Formatters

Converts raw API responses to AI-readable markdown.

## WHERE TO LOOK

| File | Purpose |
|------|---------|
| `index.ts` | Barrel export + `formatResponse()` dispatcher + `normalizeResponse()` |
| `vault.ts` | File operations: list, read, write, delete, move, split, combine |
| `search.ts` | Search results + fragment results |
| `graph.ts` | Graph traversal, neighbors, path, stats, tag analysis |
| `dataview.ts` | Dataview queries + Bases operations |
| `view.ts` | View file, window, active, open in Obsidian |
| `system.ts` | System info, commands, workflow suggestions, edit results, web fetch |
| `utils.ts` | Shared: `truncate`, `interpretScore`, `formatFileSize`, `formatDate`, `header`, `property`, `tip`, `summaryFooter` |

## CONVENTIONS

- **Type-safe**: Each formatter exports explicit TypeScript interfaces (SearchResult, FileListResponse, etc.)
- **Dispatcher key format**: `${tool}.${action}` — e.g., `vault.read`, `graph.neighbors`, `dataview.query`
- **Raw mode**: Pass `raw: true` to `formatResponse()` to get JSON instead of markdown
- **Response normalization**: index.ts transforms router field names to what formatters expect (e.g., `oldPath` → `source`)
- **Fallback handling**: Formatters handle both array and object response formats gracefully
- **Fragment support**: Handles multi-file and single-file fragment result formats

## ANTI-PATTERNS

- **Don't skip normalizeResponse()**: Formatters expect specific fields — router returns different names. Normalize first in index.ts
- **Don't hardcode response shapes**: Use the interfaces defined in each file — they reflect actual API responses
- **Don't forget formatter errors**: `formatResponse()` catches errors and falls back to raw JSON with error note

## KEY PATTERNS

```typescript
// Dispatcher in index.ts
formatResponse(tool, action, response, raw?: boolean)

// Example: route to formatter
case 'vault.search':
  return formatSearchResults(normalized);

// Fragment response normalization (multi-file grouped)
normalizeResponse('vault.fragments', response) → { files: [{ path, fragments, totalFragments }], totalResults, query }
```