'use strict';

const schema = process.env.DB_SCHEMA || 'doctorbook_schema';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'users', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        full_name: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(180),
          allowNull: false,
          unique: true,
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        role: {
          type: Sequelize.ENUM('admin', 'doctor', 'patient'),
          allowNull: false,
        },
        profile_photo: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }
    );

    await queryInterface.addIndex({ tableName: 'users', schema }, ['role'], {
      name: 'users_role_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'users', schema });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "${schema}"."enum_users_role";`
    );
  },
};
