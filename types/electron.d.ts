export interface ElectronAPI {
  platform: NodeJS.Platform;
  isElectron: boolean;
  getAppPath: () => Promise<string>;
  getVersion: () => Promise<string>;
  getDatabasePath: () => Promise<string>;
  getFilesPath: () => Promise<string>;
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    clear: () => Promise<boolean>;
  };
  openExternal: (url: string) => Promise<boolean>;
  showItemInFolder: (path: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
