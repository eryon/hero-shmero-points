import { run } from './settings-v2';

export async function applyMigrations() {
  return Promise.allSettled([run()]);
}
