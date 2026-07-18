# OBSIDIAN MCP PLUGIN — AGENTS.md

**Generated:** 2026-07-17
**Source:** package.json (0.11.42)

## OVERVIEW

Hybrid Obsidian plugin: local REST API + semantic MCP operations + direct Obsidian API integration. Dual mode: plugin (browser) + headless (Node.js via obsidian-shim).

## STRUCTURE

```
src/
├── main.ts              # Plugin entry, default export ObsidianMCPPlugin
├── mcp-server.ts        # HTTP/MCP server (MCPHttpServer class)
├── utils/               # 22 utilities, ObsidianAPI abstraction (CRITICAL)
├── tools/               # 9 tools: semantic-tools.ts, graph-*.ts, etc.
├── formatters/          # 8 formatters, ${tool}.${action} dispatch
├── security/            # 5 modules, 8-layer path validation pipeline
├── indexing/            # 4 semantic indexers, 3-strategy retriever
├── types/               # Type definitions
├── semantic/            # Semantic routing
└── workers/             # Worker dispatch patterns
tests/                   # Integration tests, *.test.ts, mocks in __mocks__/
headless/                # Standalone Node.js server
```

## COMMANDS

| Command | Action |
|---------|--------|
| `npm run dev` | Watch mode |
| `npm run build` | Production build (syncs version first) |
| `npm run test` | Jest tests |
| `npm run lint` | ESLint |

## CONVENTIONS

- **Source of truth**: `package.json` for version — sync-version.mjs propagates to `manifest.json` + `version.ts`
- **Tags**: no `v` prefix (e.g. `0.11.7` not `v0.11.7`)
- **Indentation**: 2 spaces
- **Dual mode**: Plugin (browser) + Headless (Node.js) with obsidian-shim
- **SOLID**: ObsidianAPI interface must remain stable for extensions
- **Tests**: `tests/` root + `src/utils/__tests__/`; mock Obsidian API via `tests/__mocks__/obsidian.ts`

## KEY MODULES

| Module | File | Purpose |
|--------|------|---------|
| Vault API | `src/utils/obsidian-api.ts` | Primary vault abstraction layer |
| Search | `src/utils/search-facade.ts` | Routing across indexing strategies |
| Security | `src/security/vault-security.ts` | `VaultSecurityManager.validateOperation()` — 8-layer path validation |
| Formatters | `src/formatters/` | `normalizeResponse()` required, type-safe interfaces |
| Tools | `src/tools/` | 7 base tools + Dataview; read-only mode checks; SSRF protection in fetch |
| Indexing | `src/indexing/` | 3-strategy retriever (semantic, graph, keyword); synchronous search |

## ANTI-PATTERNS

- **DO NOT** use `dangerouslyDisableAuth` unless absolutely necessary
- **DO NOT** use `with` statement
- **DO NOT** forget `npm run build && npm run lint && npm test` before push
- **DO NOT** use `returnFullFile` in large files (high token cost)
- **DO NOT** add comments unless asked
