'use strict';

const bcrypt = require('bcryptjs');

const schema = process.env.DB_SCHEMA || 'doctorbook_schema';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Admin@12345', 10);
    const now = new Date();

    await queryInterface.bulkInsert(
      { tableName: 'users', schema },
      [
        {
          full_name: 'System Admin',
          email: 'admin@doctorbook.local',
          phone: '9999999999',
          password_hash: passwordHash,
          role: 'admin',
          profile_photo: null,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ]
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      { tableName: 'users', schema },
      { email: 'admin@doctorbook.local' }
    );
  },
};
