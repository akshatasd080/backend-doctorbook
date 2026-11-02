require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'doctorbook_user',
    password: process.env.DB_PASSWORD || 'Doctorbook@2026',
    database: process.env.DB_NAME || 'doctorbook_db',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    schema: process.env.DB_SCHEMA || 'doctorbook_schema',
    logging: console.log,
    migrationStorageTableSchema: process.env.DB_SCHEMA || 'doctorbook_schema',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    seederStorageTableSchema: process.env.DB_SCHEMA || 'doctorbook_schema',
    dialectOptions: {
      // Uncomment below if you use SSL in production
      // ssl: { require: true, rejectUnauthorized: false }
    },
    define: {
      underscored: true,
      timestamps: true,
      schema: process.env.DB_SCHEMA || 'doctorbook_schema',
    },
  },
  test: {
    username: process.env.DB_USER || 'doctorbook_user',
    password: process.env.DB_PASSWORD || 'Doctorbook@2026',
    database: process.env.DB_NAME || 'doctorbook_db_test',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    schema: process.env.DB_SCHEMA || 'doctorbook_schema',
    logging: false,
    migrationStorageTableSchema: process.env.DB_SCHEMA || 'doctorbook_schema',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    seederStorageTableSchema: process.env.DB_SCHEMA || 'doctorbook_schema',
    define: {
      underscored: true,
      timestamps: true,
      schema: process.env.DB_SCHEMA || 'doctorbook_schema',
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    schema: process.env.DB_SCHEMA || 'doctorbook_schema',
    logging: false,
    migrationStorageTableSchema: process.env.DB_SCHEMA || 'doctorbook_schema',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    seederStorageTableSchema: process.env.DB_SCHEMA || 'doctorbook_schema',
    define: {
      underscored: true,
      timestamps: true,
      schema: process.env.DB_SCHEMA || 'doctorbook_schema',
    },
  },
};
