import { DatabaseSync, backup } from 'node:sqlite';
import { mkdir, chmod, access, open } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export async function backupDatabase(source, destination) {
  const input = resolve(source), output = resolve(destination);
  if (input === output) throw new Error('Backup must use a different path');
  await access(input);
  await mkdir(dirname(output), { recursive: true, mode: 0o700 });
  // Exclusive creation protects existing backups, including concurrent invocations.
  const handle = await open(output, 'wx', 0o600); await handle.close();
  const db = new DatabaseSync(input, { readOnly: true });
  try { await backup(db, output); } finally { db.close(); }
  await chmod(output, 0o600);
  const copy = new DatabaseSync(output, { readOnly: true });
  try {
    if (copy.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Backup integrity check failed');
  } finally { copy.close(); }
  return output;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [source, destination] = process.argv.slice(2);
  if (!source || !destination) { console.error('Usage: node backup.mjs SOURCE.sqlite NEW-BACKUP.sqlite'); process.exitCode = 1; }
  else backupDatabase(source, destination).then(() => console.log('Backup created and integrity checked.')).catch(error => { console.error(error.message); process.exitCode = 1; });
}
