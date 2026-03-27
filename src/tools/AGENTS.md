# AGENTS.md - src/tools

## OVERVIEW

MCP tool implementations providing semantic vault operations (8 tool groups), graph traversal, Dataview integration, and content editing.

## WHERE TO LOOK

| Task | File | Key |
|------|------|-----|
| Tool definitions | `semantic-tools.ts` | `createSemanticTool()`, `semanticTools` array |
| Graph search | `graph-search-tool.ts` | `GraphSearchTool.execute()` |
| Graph traversal | `graph-search-traversal.ts` | `GraphSearchTraversal.searchTraverse()` |
| Tag traversal | `graph-search-tag-traversal.ts` | `GraphSearchTagTraversal.searchTraverseWithTags()` |
| Tag operations | `graph-tag-tool.ts` | `GraphTagTool.execute()` |
| Dataview | `dataview-tool.ts` | `DataviewTool.executeQuery()` |
| Web fetch | `fetch.ts` | `fetchTool.handler()` |
| Content editing | `window-edit.ts` | `performWindowEdit()`, `windowEditTools` |

## CONVENTIONS

- Tool handlers receive `(api: ObsidianAPI, args: any)` and return MCP-formatted responses
- Graph traversal classes extend `GraphSearchTraversal` for shared logic
- Dataview operations handled separately in `semantic-tools.ts` handler (lines 61-158)
- All tool handlers return `{ content: [{ type: 'text' | 'image', ... }], isError?: boolean }`
- `semantic-tools.ts` provides 7 base tools + optional Dataview based on `isDataviewToolAvailable()`

## ANTI-PATTERNS

- **DO NOT** return large files in full—use `returnFullFile` parameter with caution
- **DO NOT** skip read-only mode checks before write operations (see `semantic-tools.ts:37-58`)
- **DO NOT** forget to validate Dataview availability before querying (throws if unavailable)
- **DO NOT** bypass SSRF protection in fetch tool (private IP ranges blocked, see `fetch.ts:48-71`)
- **DO NOT** perform window edits on image files (checked in `window-edit.ts:18-20`)
- **DO NOT** return unconverted Dataview values—use `convertDataviewValue()` helper