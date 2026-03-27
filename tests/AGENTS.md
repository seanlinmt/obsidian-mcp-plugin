# tests/

## OVERVIEW
Integration tests using Jest with a custom Obsidian API mock.

## WHERE TO LOOK
| File | Purpose |
|------|---------|
| `mcp-server.test.ts` | MCP HTTP server instantiation and port config |
| `graph-search-traversal.test.ts` | Graph link traversal and path finding |
| `dataview-integration.test.ts` | Dataview query execution |
| `security/vault-security-manager.test.ts` | Vault security manager operations |
| `security/path-validator.test.ts` | Path validation and security checks |
| `__mocks__/obsidian.ts` | Custom Obsidian API mock (125 lines) |

Additional test files: `input-validator.test.ts`, `search-tag-operator.test.ts`, `recursive-copy.test.ts`, `read-only-mode.test.ts`, `patch-operations.test.ts`

## CONVENTIONS
- Test files use `*.test.ts` pattern in `tests/` root
- Mock the `fs` module in each test file to prevent actual file system operations
- Import Obsidian classes via `import { App } from 'obsidian'` - jest config maps to mock
- Server start/stop tests require more complex mocking of Express and network interfaces

## ANTI-PATTERNS
- Never perform real file system operations - always mock `fs` module
- Do not test server network behavior without mocking Express and interfaces
- Never import real Obsidian API - use `tests/__mocks__/obsidian.ts` instead