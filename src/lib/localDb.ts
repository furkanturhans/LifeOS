import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/generated/local_db.json');

function ensureDbFile() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}, null, 2), 'utf-8');
  }
}

export function getLocalUser(supabaseId: string): any | null {
  try {
    ensureDbFile();
    const data = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(data);
    return db[supabaseId] || null;
  } catch (error) {
    console.error('Error reading local DB:', error);
    return null;
  }
}

export function saveLocalUser(supabaseId: string, userData: any): any {
  try {
    ensureDbFile();
    const data = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(data);

    // Merge existing user data to avoid wiping out settings/fields
    const existing = db[supabaseId] || {};
    const updated = {
      ...existing,
      ...userData,
      supabaseId,
      updatedAt: new Date().toISOString(),
    };

    if (!updated.id) {
      updated.id = existing.id || `local_${Date.now()}`;
    }
    if (!updated.createdAt) {
      updated.createdAt = existing.createdAt || new Date().toISOString();
    }

    db[supabaseId] = updated;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    return updated;
  } catch (error) {
    console.error('Error writing to local DB:', error);
    return userData;
  }
}

export function isLocalUsernameUnique(lifeosId: string, excludeSupabaseId?: string): boolean {
  try {
    ensureDbFile();
    const data = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(data);
    const lowercaseId = lifeosId.toLowerCase();

    for (const key of Object.keys(db)) {
      if (excludeSupabaseId && key === excludeSupabaseId) {
        continue;
      }
      if (db[key].lifeosId?.toLowerCase() === lowercaseId) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking local username uniqueness:', error);
    return true;
  }
}
