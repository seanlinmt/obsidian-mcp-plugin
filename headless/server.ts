
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Configure runtime module alias manually (no external dependency needed)
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id: string) {
    if (id === 'obsidian') {
        return require('./obsidian-shim');
    }
    return originalRequire.apply(this, arguments);
};

// Now import dependencies that use 'obsidian'
import { MCPHttpServer } from '../src/mcp-server';
import { App, Vault, MetadataCache, TFile, TFolder, TAbstractFile } from './obsidian-shim';
import { getAllTags } from './obsidian-shim'; // Must match export style

// Polyfill for glob (simple version or use a library if available)
// Using recursive readdir for simplicity
function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], rootPath: string = dirPath): string[] {
    // Only if directory exists
    if (!fs.existsSync(dirPath)) return [];
    
    const files = fs.readdirSync(dirPath);

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== '.git' && file !== 'node_modules') {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, rootPath);
            }
        } else {
            // Relativize path
            let relativePath = path.relative(rootPath, fullPath);
            // Ensure forward slashes
            relativePath = relativePath.split(path.sep).join('/');
            arrayOfFiles.push(relativePath);
        }
    });

    return arrayOfFiles;
}

class HeadlessVault extends Vault {
    basePath: string;
    
    constructor(basePath: string) {
        super();
        this.basePath = path.resolve(basePath);
        this.adapter = { basePath: this.basePath };
        
        // Ensure vault directory exists
        if (!fs.existsSync(this.basePath)) {
            console.log(`Creating vault directory at ${this.basePath}`);
            fs.mkdirSync(this.basePath, { recursive: true });
        }
    }
    
    getName() {
        return path.basename(this.basePath);
    }
    
    getAbstractFileByPath(filePath: string): TAbstractFile | null {
        const fullPath = path.join(this.basePath, filePath);
        if (!fs.existsSync(fullPath)) return null;
        
        const stats = fs.statSync(fullPath);
        const name = path.basename(filePath);
        
        if (stats.isDirectory()) {
            return new TFolder(name, filePath);
        } else {
            const file = new TFile(name, filePath);
            file.stat = {
                size: stats.size,
                mtime: stats.mtimeMs,
                ctime: stats.ctimeMs
            };
            return file;
        }
    }
    
    async read(file: TFile): Promise<string> {
        const fullPath = path.join(this.basePath, file.path);
        return fs.promises.readFile(fullPath, 'utf8');
    }
    
    async readBinary(file: TFile): Promise<ArrayBuffer> {
        const fullPath = path.join(this.basePath, file.path);
        const buffer = await fs.promises.readFile(fullPath);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
    
    async modify(file: TFile, data: string): Promise<void> {
        const fullPath = path.join(this.basePath, file.path);
        await fs.promises.writeFile(fullPath, data, 'utf8');
        
        // Update stat
        const stats = await fs.promises.stat(fullPath);
        file.stat = {
            size: stats.size,
            mtime: stats.mtimeMs,
            ctime: stats.ctimeMs
        };
    }
    
    async create(filePath: string, data: string): Promise<TFile> {
        const fullPath = path.join(this.basePath, filePath);
        const dir = path.dirname(fullPath);
        
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
        
        await fs.promises.writeFile(fullPath, data, 'utf8');
        
        const stats = await fs.promises.stat(fullPath);
        const name = path.basename(filePath);
        const file = new TFile(name, filePath);
        file.stat = {
            size: stats.size,
            mtime: stats.mtimeMs,
            ctime: stats.ctimeMs
        };
        return file;
    }
    
    async createFolder(folderPath: string): Promise<void> {
        const fullPath = path.join(this.basePath, folderPath);
        await fs.promises.mkdir(fullPath, { recursive: true });
    }
    
    getAllLoadedFiles(): TAbstractFile[] {
        const filePaths = getAllFiles(this.basePath);
        return filePaths.map(p => this.getAbstractFileByPath(p)).filter((f): f is TAbstractFile => f !== null);
    }
    
    getMarkdownFiles(): TFile[] {
        return this.getAllLoadedFiles()
            .filter((f): f is TFile => f instanceof TFile && f.extension.toLowerCase() === 'md');
    }
}

class HeadlessMetadataCache extends MetadataCache {
    vault: HeadlessVault;
    
    constructor(vault: HeadlessVault) {
        super();
        this.vault = vault;
    }
    
    getFileCache(file: TFile): any {
        // Simple frontmatter parser
        try {
            const fullPath = path.join(this.vault.basePath, file.path);
            if (!fs.existsSync(fullPath)) return null;
            
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Extract frontmatter
            const match = content.match(/^---\n([\s\S]*?)\n---/);
            if (match) {
                // Return basic structure
                // Ideally use js-yaml here if available, but for now simple regex or mock
                return {
                    frontmatter: {}, // We'll need a proper parser for real usage, but for now empty is better than crash
                    tags: [] // Parse tags from content #tag
                };
            }
            return { tags: [] };
        } catch (e) {
            return null;
        }
    }
}

class HeadlessApp extends App {
    constructor(vaultPath: string) {
        super();
        this.vault = new HeadlessVault(vaultPath);
        this.metadataCache = new HeadlessMetadataCache(this.vault);
        this.workspace = {
            getActiveFile: () => {
                // Return the first markdown file or null
                const files = this.vault.getMarkdownFiles();
                return files.length > 0 ? files[0] : null;
            },
            getLeaf: () => ({ openFile: async () => {} })
        };
    }
}

// Main execution
const VAULT_PATH = process.env.VAULT_PATH || '/vault';
const PORT = parseInt(process.env.PORT || '3001');

console.log(`Starting Headless Obsidian MCP Server on port ${PORT}`);
console.log(`Vault Path: ${VAULT_PATH}`);

const app = new HeadlessApp(VAULT_PATH);

// Create plugin mock to pass settings
const pluginMock = {
    settings: {
        httpPort: PORT,
        apiKey: process.env.MCP_API_KEY || '', // Optional API key
        readOnlyMode: process.env.READ_ONLY === 'true'
    },
    ignoreManager: {
        isExcluded: () => false,
        filterPaths: (paths: string[]) => paths
    },
    manifest: {
        dir: __dirname
    }
};

const server = new MCPHttpServer(app as any, PORT, pluginMock);

server.start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
