/**
 * Quick script to verify PostgreSQL connection using .env settings.
 *
 * Usage:
 *   node scripts/check-db.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

async function check() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
      schema: process.env.DB_SCHEMA,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('SUCCESS: Connected to PostgreSQL');
    console.log(`  Host     : ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`  Database : ${process.env.DB_NAME}`);
    console.log(`  User     : ${process.env.DB_USER}`);
    console.log(`  Schema   : ${process.env.DB_SCHEMA}`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('FAILED: Could not connect to PostgreSQL');
    console.error(`  ${err.message}`);
    console.error('');
    console.error('Check:');
    console.error('  1. PostgreSQL service is running');
    console.error('  2. .env credentials match Information/setup.txt');
    console.error('  3. User/database/schema were created (see README)');
    process.exit(1);
  }
}

check();
