import electronLog from 'electron-log';
export { electronLog };
interface CleaningLogEntry {
    inputPath: string;
    outputPath: string;
    status: "success";
    timestamp: string;
    fileType: "image" | "video";
    originalSize?: number;
    cleanedSize?: number;
}
export declare const appendToCleaningLog: (entry: CleaningLogEntry) => void;
