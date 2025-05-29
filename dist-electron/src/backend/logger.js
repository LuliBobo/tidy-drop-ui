import fs from 'fs-extra';
import os from 'os';
import path from 'path';
// Import electron-log package
import electronLog from 'electron-log';
const logPath = path.join(os.homedir(), 'Cleaned', 'cleaned-log.json');
// Configure electron-log
electronLog.transports.file.resolvePathFn = () => path.join(os.homedir(), 'Cleaned', 'app-logs.log');
electronLog.transports.file.level = 'info';
// Export electronLog for use in other modules
export { electronLog };
// Ensure the log directory exists
fs.ensureDirSync(path.dirname(logPath));
if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '', 'utf8');
}
export const appendToCleaningLog = (entry) => {
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(logPath, line, 'utf8');
};
