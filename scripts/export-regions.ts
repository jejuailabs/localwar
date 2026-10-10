import fs from 'node:fs';
import { REGIONS } from '../lib/regions';
fs.writeFileSync(
  'functions/src/shared/regions.ts',
  'export const REGION_CODES = ' + JSON.stringify(REGIONS.map((r) => r.code)) + ';\n',
);
