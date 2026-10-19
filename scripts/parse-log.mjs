import fs from 'fs';
import path from 'path';

const logPath = 'C:/Users/dhara/.gemini/antigravity/brain/bcb692ad-5095-4f13-8192-91b639968b1e/.system_generated/tasks/task-1432.log';
const log = fs.readFileSync(logPath, 'utf8');
const seriesMap = new Map();
let currentMsgId = null, currentFile = null, currentSize = null;

log.split('\n').forEach(line => {
  if (line.includes('Message ID :')) currentMsgId = parseInt(line.split(':')[1].trim(), 10);
  if (line.includes('File Name  :')) currentFile = line.split(':')[1].trim();
  if (line.includes('File Size  :')) currentSize = line.split(':')[1].trim();
  if (currentMsgId && currentFile && currentSize) {
    let clean = currentFile.replace(/[-_ ]*@\w+.*$/g, '').trim();
    let sName = 'Unknown';
    if (clean.toLowerCase().includes('take charge')) sName = 'Take Charge of My Heart';
    else if (clean.toLowerCase().includes('tyson')) sName = 'Tyson';
    else if (clean.toLowerCase().includes('the trap')) sName = 'The Trap';
    else if (clean.toLowerCase().includes('jackpot') || clean.toLowerCase().includes('ordinary')) sName = 'The Ordinary Jackpot';
    else if (clean.toLowerCase().includes('court')) sName = 'The Court';
    else if (clean.toLowerCase().includes('heart beat')) sName = 'Heart Beat';
    else sName = clean.split('S0')[0].trim();
    
    if (!seriesMap.has(sName)) seriesMap.set(sName, []);
    seriesMap.get(sName).push({ msgId: currentMsgId, file: currentFile, size: currentSize });
    currentMsgId = null; currentFile = null; currentSize = null;
  }
});

for (const [name, files] of seriesMap.entries()) {
  const minId = Math.min(...files.map(f => f.msgId));
  const maxId = Math.max(...files.map(f => f.msgId));
  console.log(`Series: "${name}" | Total Files: ${files.length} | Msg Range: #${minId} -> #${maxId}`);
}
