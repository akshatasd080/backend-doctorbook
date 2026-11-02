/**
 * Creates doctorbook_user, doctorbook_db, and doctorbook_schema if missing.
 * Uses the postgres superuser connection from env (or prompts via defaults).
 *
 * Usage:
 *   set PG_SUPERUSER=postgres
 *   set PG_SUPERPASSWORD=your_postgres_password
 *   node scripts/setup-db.js
 */

require('dotenv').config();
const { Client } = require('pg');

const APP_USER = process.env.DB_USER || 'doctorbook_user';
const APP_PASSWORD = process.env.DB_PASSWORD || 'Doctorbook@2026';
const APP_DB = process.env.DB_NAME || 'doctorbook_db';
const APP_SCHEMA = process.env.DB_SCHEMA || 'doctorbook_schema';
const HOST = process.env.DB_HOST || 'localhost';
const PORT = Number(process.env.DB_PORT) || 5432;

const SUPERUSER = process.env.PG_SUPERUSER || 'postgres';
const SUPERPASSWORD = process.env.PG_SUPERPASSWORD || process.env.POSTGRES_PASSWORD;

async function run() {
  if (!SUPERPASSWORD) {
    console.error('Set PG_SUPERPASSWORD (postgres user password) then re-run:');
    console.error('  $env:PG_SUPERPASSWORD="your_postgres_password"; node scripts/setup-db.js');
    process.exit(1);
  }

  const admin = new Client({
    host: HOST,
    port: PORT,
    user: SUPERUSER,
    password: SUPERPASSWORD,
    database: 'postgres',
  });

  await admin.connect();
  console.log('Connected as', SUPERUSER);

  await admin.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${APP_USER}') THEN
        CREATE USER ${APP_USER} WITH PASSWORD '${APP_PASSWORD}';
        RAISE NOTICE 'Created user ${APP_USER}';
      ELSE
        ALTER USER ${APP_USER} WITH PASSWORD '${APP_PASSWORD}';
        RAISE NOTICE 'Updated password for ${APP_USER}';
      END IF;
    END
    $$;
  `);

  const dbCheck = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [APP_DB]
  );

  if (dbCheck.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${APP_DB} OWNER ${APP_USER}`);
    console.log(`Created database ${APP_DB}`);
  } else {
    console.log(`Database ${APP_DB} already exists`);
  }

  await admin.query(`REVOKE CONNECT ON DATABASE ${APP_DB} FROM PUBLIC`);
  await admin.query(`GRANT CONNECT ON DATABASE ${APP_DB} TO ${APP_USER}`);
  await admin.end();

  const dbClient = new Client({
    host: HOST,
    port: PORT,
    user: SUPERUSER,
    password: SUPERPASSWORD,
    database: APP_DB,
  });

  await dbClient.connect();

  await dbClient.query(
    `CREATE SCHEMA IF NOT EXISTS ${APP_SCHEMA} AUTHORIZATION ${APP_USER}`
  );
  await dbClient.query(`REVOKE ALL ON SCHEMA ${APP_SCHEMA} FROM PUBLIC`);
  await dbClient.query(`GRANT USAGE, CREATE ON SCHEMA ${APP_SCHEMA} TO ${APP_USER}`);
  await dbClient.query(
    `ALTER ROLE ${APP_USER} SET search_path TO ${APP_SCHEMA}, public`
  );
  await dbClient.query(
    `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ${APP_SCHEMA} TO ${APP_USER}`
  );
  await dbClient.query(
    `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ${APP_SCHEMA} TO ${APP_USER}`
  );
  await dbClient.query(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA ${APP_SCHEMA} GRANT ALL ON TABLES TO ${APP_USER}`
  );
  await dbClient.query(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA ${APP_SCHEMA} GRANT ALL ON SEQUENCES TO ${APP_USER}`
  );

  await dbClient.end();
  console.log('Schema ready:', APP_SCHEMA);
  console.log('Done. Next: npm run db:migrate && npm run db:seed');
}

run().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
