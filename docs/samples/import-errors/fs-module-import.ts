import * as fs from 'fs';
import * as path from 'path';

export function readConfigFile(configPath: string) {
  const fullPath = path.resolve(configPath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}