import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import electronLog from 'electron-log';
import { appendToCleaningLog } from './logger';

// Nastavenie logovania
electronLog.transports.file.resolvePathFn = () => path.join(process.env.HOME || '', 'DropTidy/logs.txt');
electronLog.transports.file.level = 'info';
electronLog.transports.console.level = 'debug';
electronLog.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';
electronLog.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
electronLog.transports.file.sync = true;

// Vytvorenie log adresára ak neexistuje
const logDir = path.join(process.env.HOME || '', 'DropTidy');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

interface MetadataInfo {
  [key: string]: string | number;
}

interface CleanResult {
  success: boolean;
  originalSize?: number;
  cleanedSize?: number;
  metadata?: MetadataInfo;
}

export const readMetadata = async (filePath: string): Promise<MetadataInfo> => {
  try {
    electronLog.info(`Reading metadata from: ${filePath}`);

    const result = await new Promise<string>((resolve, reject) => {
      const command = 'exiftool';
      const args = ['-json', filePath];
      const process = spawn(command, args);
      
      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`ExifTool exited with code ${code}`));
        }
      });

      process.on('error', (err) => {
        electronLog.error(`Error reading metadata: ${err.message}`);
        reject(err);
      });
    });

    const metadata = JSON.parse(result)[0];
    electronLog.info(`Successfully read metadata from ${filePath}`);
    return metadata;
  } catch (error) {
    electronLog.error(`Error reading metadata: ${error}`);
    return {};
  }
};

export const cleanImage = async (filePath: string): Promise<CleanResult> => {
  try {
    const originalSize = (await fs.stat(filePath)).size;
    const metadata = await readMetadata(filePath);
    electronLog.info(`Starting image cleaning: ${filePath}`);

    const result = await new Promise<boolean>((resolve, reject) => {
      const command = 'exiftool';
      const args = ['-all=', '-overwrite_original', filePath];
      const process = spawn(command, args);

      process.on('close', (code) => resolve(code === 0));
      process.on('error', (err) => {
        electronLog.error(`Error cleaning image: ${err.message}`);
        reject(err);
      });
    });

    if (result) {
      const cleanedSize = (await fs.stat(filePath)).size;
      electronLog.info(`Successfully cleaned image. Size reduction: ${originalSize - cleanedSize} bytes`);
      
      // Add JSON logging
      appendToCleaningLog({
        inputPath: filePath,
        outputPath: filePath, // For images, input and output are the same since we overwrite
        status: "success",
        timestamp: new Date().toISOString(),
        fileType: "image",
        originalSize,
        cleanedSize
      });
      
      return { success: true, originalSize, cleanedSize, metadata };
    }
    
    electronLog.error('Failed to clean image');
    return { success: false };
  } catch (error) {
    electronLog.error(`Error in cleanImage: ${error}`);
    return { success: false };
  }
};

export const cleanVideo = async (input: string, output: string): Promise<CleanResult> => {
  try {
    const originalSize = (await fs.stat(input)).size;
    electronLog.info(`Starting video cleaning: ${input}`);

    const result = await new Promise<boolean>((resolve, reject) => {
      const command = 'ffmpeg';
      const args = ['-i', input, '-map_metadata', '-1', '-c:v', 'copy', '-c:a', 'copy', output];
      const process = spawn(command, args);

      process.on('close', (code) => resolve(code === 0));
      process.on('error', (err) => {
        electronLog.error(`Error cleaning video: ${err.message}`);
        reject(err);
      });
    });

    if (result) {
      const cleanedSize = (await fs.stat(output)).size;
      electronLog.info(`Successfully cleaned video. Size reduction: ${originalSize - cleanedSize} bytes`);
      
      // Add JSON logging
      appendToCleaningLog({
        inputPath: input,
        outputPath: output,
        status: "success",
        timestamp: new Date().toISOString(),
        fileType: "video",
        originalSize,
        cleanedSize
      });
      
      return { success: true, originalSize, cleanedSize };
    }

    electronLog.error('Failed to clean video');
    return { success: false };
  } catch (error) {
    electronLog.error(`Error in cleanVideo: ${error}`);
    return { success: false };
  }
};

export const createZipExport = async (files: string[]): Promise<string> => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const zipPath = path.join(process.env.HOME || '', 'DropTidy/export.zip');

  try {
    electronLog.info('Starting ZIP export');
    
    for (const file of files) {
      const content = await fs.readFile(file);
      zip.file(path.basename(file), content);
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.ensureDir(path.dirname(zipPath));
    await fs.writeFile(zipPath, buffer);
    
    electronLog.info(`Successfully created ZIP export: ${zipPath}`);
    return zipPath;
  } catch (error) {
    electronLog.error(`Error creating ZIP export: ${error}`);
    throw error;
  }
};