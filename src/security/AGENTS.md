# Security Module

## OVERVIEW
Security layer enforcing path validation, operation permissions, and ignore patterns to protect vault integrity.

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Path traversal prevention | `path-validator.ts` | **CRITICAL** — 8-layer validation pipeline |
| Vault permission management | `vault-security-manager.ts` | Single entry point for all vault ops |
| Ignore patterns | `mcp-ignore-manager.ts` | .gitignore-style exclusions |
| Secure API wrapper | `secure-obsidian-api.ts` | Intercepts ObsidianAPI calls |

## KEY PATTERNS

### Path Validation Pipeline (path-validator.ts)
```
1. Null/undefined check
2. Dangerous pattern detection (../, %2e%2e, null bytes)
3. Reject absolute paths
4. Obsidian normalizePath()
5. Node.js path.resolve()
6. Path normalize()
7. Boundary check (stays in vault)
8. Real path verification
```

### Security Manager Flow (vault-security-manager.ts)
```typescript
// Single entry point for ALL operations
const validated = await security.validateOperation({
  type: OperationType.READ,  // or CREATE, UPDATE, DELETE, etc.
  path: 'notes/my-note.md',
  targetPath?: 'notes/new-name.md'  // for move/rename
});
// validated.path now contains safe ValidatedPath
```

### Ignore Patterns (mcp-ignore-manager.ts)
```typescript
// Check if path is excluded
const excluded = ignoreManager.isExcluded('private/notes.md');

// Filter multiple paths
const safePaths = ignoreManager.filterPaths(allPaths);
```

## CONVENTIONS

- **Always use** `VaultSecurityManager.validateOperation()` for file operations — never bypass it
- **Never expose** unvalidated paths to ObsidianAPI — always use `ValidatedPath` type
- **Pattern files** use .gitignore syntax via Minimatch library
- **Presets**: `readOnly`, `safeMode`, `fullAccess` for quick security config
- **Logging**: Security events logged to Debug with emojis (🔐, 🚫, ✅)

## ANTI-PATTERNS

- **NEVER** call ObsidianAPI methods directly — always use `SecureObsidianAPI`
- **NEVER** skip path validation even for "internal" operations
- **NEVER** expose `ValidatedPath` as plain string — type guard enforces safety
- **NEVER** allow `..` in user-provided paths — 8-layer defense exists for this
- **NEVER** load .mcpignore on every check — uses mtime caching