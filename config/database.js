const { Sequelize } = require('sequelize');
const config = require('./config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    schema: dbConfig.schema,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions || {},
  }
);

/**
 * Test the database connection.
 * Call this once when the server starts.
 */
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully.');
    console.log(`   Database : ${dbConfig.database}`);
    console.log(`   Schema   : ${dbConfig.schema}`);
    console.log(`   Host     : ${dbConfig.host}:${dbConfig.port}`);
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
