import { Pool } from 'pg';
import { env } from '../config/env';

async function reset() {
  const pool = new Pool({ connectionString: env.DATABASE_URL, ssl: true });
  await pool.query(`
    DROP TABLE IF EXISTS expenses CASCADE;
    DROP TABLE IF EXISTS fuel_logs CASCADE;
    DROP TABLE IF EXISTS maintenance_logs CASCADE;
    DROP TABLE IF EXISTS trips CASCADE;
    DROP TABLE IF EXISTS drivers CASCADE;
    DROP TABLE IF EXISTS vehicles CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TYPE IF EXISTS role CASCADE;
    DROP TYPE IF EXISTS vehicle_status CASCADE;
    DROP TYPE IF EXISTS driver_status CASCADE;
    DROP TYPE IF EXISTS trip_status CASCADE;
    DROP TYPE IF EXISTS maintenance_status CASCADE;
  `);
  console.log('Dropped all tables and types.');
  await pool.end();
}

reset().catch(console.error);
