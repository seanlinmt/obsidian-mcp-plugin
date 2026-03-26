# src/utils — Utility Layer

## OVERVIEW

22 utilities handling vault operations, search, graph traversal, content processing, and session management.

## WHERE TO LOOK

| Task | File | Key Methods |
|------|------|-------------|
| **Vault operations** | `obsidian-api.ts` | ObsidianAPI class — abstraction layer over vault. getFile, createFile, searchPaginated |
| **Search facade** | `search-facade.ts` | SearchFacade — routes queries: operator (file:/tag:), natural language → AdvancedSearchService |
| **Search core** | `search-core.ts` | SearchCore — basic file/content search with match scoring |
| **Graph traversal** | `graph-traversal.ts` | GraphTraversal — BFS/DFS, backlinks/forward links, path finding |
| **Fuzzy matching** | `fuzzy-match.ts` | findFuzzyMatches, calculateSimilarity (Levenshtein) |
| **Content handling** | `content-handler.ts` | ensureStringContent — safe type conversion for fragments/buffers |
| **File reading** | `file-reader.ts` | readFileWithFragments — full file vs fragment retrieval |
| **Connection pool** | `connection-pool.ts` | ConnectionPool — request queuing, worker dispatch |
| **Session mgmt** | `session-manager.ts` | Session lifecycle management |

## CONVENTIONS

- ObsidianAPI is the PRIMARY interface — other modules wrap it
- SearchFacade handles routing, delegates to SearchCore or AdvancedSearchService
- Fragment retrieval uses UniversalFragmentRetriever from `src/indexing/`
- ConnectionPool routes CPU-intensive ops (search, traverse) to workers

## ANTI-PATTERNS

- **DO NOT** call vault.read directly in hot paths — use ObsidianAPI or fragment retrieval
- **AVOID** large returnFullFile on big notes — consumes tokens, use fragments instead
- **NEVER** use file.stat directly — always check TFile instanceof first
- **DON'T** ignore isExcluded check from ignoreManager before file operations