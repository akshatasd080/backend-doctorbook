'use strict';

const schema = process.env.DB_SCHEMA || 'doctorbook_schema';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'doctor_documents', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        doctor_profile_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: 'doctor_profiles', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        document_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        file_path: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        original_name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        mime_type: {
          type: Sequelize.STRING(120),
          allowNull: true,
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

    await queryInterface.addIndex(
      { tableName: 'doctor_documents', schema },
      ['doctor_profile_id'],
      { name: 'doctor_documents_doctor_profile_id_idx' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'doctor_documents', schema });
  },
};
