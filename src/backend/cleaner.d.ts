interface CleanResult {
    success: boolean;
    originalSize?: number;
    cleanedSize?: number;
}
export declare const cleanImage: (filePath: string) => Promise<CleanResult>;
export declare const cleanVideo: (input: string, output: string) => Promise<CleanResult>;
export declare const createZipExport: (files: string[]) => Promise<string>;
export {};
