import { spawn } from 'child_process';
import path from 'path';

export const cleanImage = (filePath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const command = 'exiftool';
    const args = ['-all=', '-overwrite_original', filePath];

    const process = spawn(command, args);

    process.on('close', (code) => {
      resolve(code === 0);
    });

    process.on('error', reject);
  });
};

export const cleanVideo = (input: string, output: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const command = 'ffmpeg';
    const args = ['-i', input, '-map_metadata', '-1', '-c:v', 'copy', '-c:a', 'copy', output];

    const process = spawn(command, args);

    process.on('close', (code) => {
      resolve(code === 0);
    });

    process.on('error', reject);
  });
};