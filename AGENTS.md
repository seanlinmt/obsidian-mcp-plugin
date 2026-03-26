# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-26
**Commit:** df68c1e
**Branch:** main

## OVERVIEW

Obsidian MCP Plugin — hybrid plugin combining local REST API + semantic MCP operations + direct Obsidian API integration for enhanced performance.

## STRUCTURE

```
./
├── src/                    # Main source (65 .ts files)
│   ├── main.ts            # PRIMARY: Obsidian plugin entry (default export)
│   ├── mcp-server.ts       # HTTP/MCP server (MCPHttpServer class)
│   ├── utils/             # 22 utilities (high complexity)
│   ├── tools/             # 9 MCP tool implementations
│   ├── formatters/        # 8 output formatters
│   ├── security/          # 5 security modules
│   ├── indexing/          # 4 semantic indexers
│   ├── types/             # Type definitions
│   ├── semantic/          # Semantic routing
│   └── workers/           # Worker management
├── headless/              # Standalone server (node-mcp)
├── tests/                 # Integration tests (8 files)
├── docs/                  # Documentation
└── wiki/                  # (empty/minimal)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Plugin development | `src/main.ts` | Default export ObsidianMCPPlugin class |
| MCP server | `src/mcp-server.ts` | MCPHttpServer handles HTTP transport |
| Tool implementations | `src/tools/*.ts` | semantic-tools.ts, graph-*.ts |
| Vault operations | `src/utils/obsidian-api.ts` | Abstraction layer (CRITICAL) |
| Security | `src/security/` | Path validation, vault security |
| Headless mode | `headless/server.ts` | Standalone server with shims |
| Tests | `tests/` | Integration tests, use mocks |

## CONVENTIONS (DEVIATIONS)

- **Tests**: Mixed locations (`tests/` root + `src/utils/__tests__/`)
- **Multiple entry points**: `main.ts`, `main-simple.ts`, `main-complex.ts` (only main.ts production)
- **Version sync**: `sync-version.mjs` auto-syncs package.json → manifest.json + version.ts
- **No 'v' prefix**: Tags like `0.11.7` not `v0.11.7`
- **2 spaces**: TypeScript indentation

## ANTI-PATTERNS (THIS PROJECT)

- **DO NOT use** `dangerouslyDisableAuth` unless absolutely necessary
- **DO NOT** use `with` statement (discouraged, though deemed safe here)
- **DO NOT** forget to run `npm run build && npm run lint && npm test` pre-push
- **WARNING**: Large files with `returnFullFile` consume significant context tokens

## UNIQUE STYLES

- **Dual mode**: Plugin (browser) + Headless (Node.js) with obsidian-shim
- **SOLID focus**: ObsidianAPI interface MUST remain stable for extensions
- **Performance docs**: JSDoc includes benchmarks (e.g., "~1-5ms vs ~50-100ms HTTP")

## COMMANDS

```bash
npm run dev           # Watch mode
npm run build         # Production build (syncs version first)
npm run test          # Jest tests
npm run lint          # ESLint
gh workflow run release.yml  # Create release
```

## GOTCHAS

- Version source is `package.json` ONLY — sync-version.mjs handles the rest
- CLAUDE.md has detailed architecture patterns (ObsidianAPI abstraction, etc.)
- Tests use `tests/__mocks__/obsidian.ts` for Obsidian API mocking

---

*Root knowledge base — see subdirs for domain-specific info*