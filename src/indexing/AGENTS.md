# INDEXING

Semantic indexers for fragment-based search and retrieval.

## WHERE TO LOOK

| File | Purpose |
|------|---------|
| `fragment-retriever.ts` | Entry point - unified retriever with auto-strategy selection |
| `semantic-chunk-index.ts` | Semantic chunking with context preservation |
| `adaptive-index.ts` | TF-IDF scoring with flexible term matching |
| `proximity-index.ts` | Proximity-based cluster detection |

The retriever combines three strategies: adaptive (keyword), proximity (cluster), semantic (context).

## KEY CONCEPTS

**Three indexing strategies:**
- `adaptive`: Best for short queries (<=2 words), TF-IDF scoring
- `proximity`: Best for medium queries (3-5 words), finds term clusters
- `semantic`: Best for long queries (>5 words), preserves document structure

**Auto-selection logic** in `selectOptimalStrategy()` chooses strategy by query word count.

**Hybrid mode** merges weighted results from all strategies (adaptive: 0.4, proximity: 0.3, semantic: 0.3).

## ANTI-PATTERNS

- Do not call individual indexers directly when the retriever handles strategy selection automatically
- Do not forget that all search methods are synchronous - no async/await needed for search
- Do not exceed 2 query terms for proximity search - it requires all terms to exist in a document
- Do not pass empty queries - search methods return empty arrays for falsy input

## TYPES

Dependencies: `src/types/fragment.ts` and `src/types/semantic.ts` for Fragment, SemanticResponse, and RetrievalOptions.