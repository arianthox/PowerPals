import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('db migration', () => {
  it('contains required tables and indexes', () => {
    const sqlPath = path.resolve(
      __dirname,
      '../../packages/db/prisma/migrations/202602180001_init/migration.sql'
    );
    const sql = fs.readFileSync(sqlPath, 'utf8');

    expect(sql).toContain('CREATE TABLE "Account"');
    expect(sql).toContain('CREATE TABLE "UsageSnapshot"');
    expect(sql).toContain('CREATE TABLE "SyncRun"');
    expect(sql).toContain('CREATE TABLE "AppSetting"');
    expect(sql).toContain('CREATE UNIQUE INDEX "Account_credentialRef_key"');
  });
});
