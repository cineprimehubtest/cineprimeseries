import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const catalogPath = path.join(projectRoot, 'data', 'catalog.json');
const seedPath = path.join(projectRoot, 'lib', 'seedData.ts');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const content = `import { Series } from "@/types";

export const INITIAL_SERIES: Series[] = ${JSON.stringify(catalog, null, 2)};
`;

fs.writeFileSync(seedPath, content, 'utf8');
console.log('✅ seedData.ts synced from catalog.json!');
