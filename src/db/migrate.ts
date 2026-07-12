import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../config/db';
import { Pool } from 'pg';
import { env } from '../config/env';

async function main() {
  console.log('Running migrations...');
  const pool = new Pool({ connectionString: env.DATABASE_URL, ssl: true });
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations complete');
  await pool.end();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
