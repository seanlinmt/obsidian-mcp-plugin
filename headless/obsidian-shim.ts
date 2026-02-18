
export class App {
    vault: any;
    workspace: any;
    metadataCache: any;
    fileManager: any;
    constructor() {
        this.vault = new Vault();
        this.workspace = new Workspace();
        this.metadataCache = new MetadataCache();
        this.fileManager = new FileManager();
    }
}

export class Vault {
    adapter: any = { basePath: '/vault' };
    
    getName() { return "HeadlessVault"; }
    
    getAbstractFileByPath(path: string): TAbstractFile | null {
        // This will be overridden or implemented in the actual MockVault
        return null; 
    }
    
    getRoot() { return new TFolder("/", "/"); }
    
    read(file: TFile): Promise<string> { return Promise.resolve(""); }
    
    modify(file: TFile, data: string): Promise<void> { return Promise.resolve(); }
    
    create(path: string, data: string): Promise<TFile> { return Promise.resolve(new TFile("new", path)); }
    
    createFolder(path: string): Promise<void> { return Promise.resolve(); }
    
    trash(file: TAbstractFile, system: boolean): Promise<void> { return Promise.resolve(); }
    
    getAllLoadedFiles(): TAbstractFile[] { return []; }
    
    getMarkdownFiles(): TFile[] { return []; }
    
    on() {} // Event emitter stub
    off() {}
}

export class Workspace {
    activeLeaf: any = null;
    
    getActiveFile(): TFile | null { return null; }
    
    getLeaf(create?: boolean) { 
        return { 
            openFile: (file: any) => Promise.resolve() 
        }; 
    }
    
    on() {}
    off() {}
}

export class MetadataCache {
    getFileCache(file: TFile): any { return null; }
    on() {}
    off() {}
}

export class FileManager {
    trashFile(file: TAbstractFile): Promise<void> { return Promise.resolve(); }
    renameFile(file: TAbstractFile, newPath: string): Promise<void> { return Promise.resolve(); }
}

export class TAbstractFile {
    parent: TFolder | null = null;
    constructor(public name: string, public path: string) {}
}

export class TFile extends TAbstractFile {
    stat: { size: number; mtime: number; ctime: number } = { size: 0, mtime: 0, ctime: 0 };
    basename: string;
    extension: string;
    constructor(name: string, path: string) {
        super(name, path);
        this.extension = name.split('.').pop() || '';
        this.basename = name.substring(0, name.lastIndexOf('.'));
    }
}

export class TFolder extends TAbstractFile {
    children: TAbstractFile[] = [];
    isRoot() { return this.path === '/'; }
}

export class Notice {
    constructor(message: string, timeout?: number) {
        console.log(`[Notice] ${message}`);
    }
}

export class Plugin {
    app: App;
    manifest: any;
    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }
    loadData() { return Promise.resolve({}); }
    saveData(data: any) { return Promise.resolve(); }
    addSettingTab(tab: any) {}
    registerView(type: string, viewCreator: any) {}
    addCommand(command: any) {}
}

export class PluginSettingTab {
    app: App;
    plugin: Plugin;
    constructor(app: App, plugin: Plugin) {
        this.app = app;
        this.plugin = plugin;
    }
    display() {}
    hide() {}
}

export function getAllTags(cache: any): string[] {
    return cache.tags ? cache.tags.map((t: any) => t.tag) : [];
}

export type Command = any;
