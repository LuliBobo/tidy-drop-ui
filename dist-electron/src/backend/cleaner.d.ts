interface MetadataInfo {
    [key: string]: string | number;
}
interface CleanResult {
    success: boolean;
    originalSize?: number;
    cleanedSize?: number;
    metadata?: MetadataInfo;
}
export declare const readMetadata: (filePath: string) => Promise<MetadataInfo>;
export declare const cleanImage: (filePath: string) => Promise<CleanResult>;
export declare const cleanVideo: (input: string, output: string) => Promise<CleanResult>;
export declare const createZipExport: (files: string[]) => Promise<string>;
export {};
