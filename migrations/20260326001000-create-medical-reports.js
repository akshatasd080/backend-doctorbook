'use strict';

const schema = process.env.DB_SCHEMA || 'doctorbook_schema';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'medical_reports', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        uploaded_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: 'users', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        patient_user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: 'users', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        appointment_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: 'appointments', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        title: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        report_type: {
          type: Sequelize.STRING(80),
          allowNull: true,
        },
        file_path: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        notes: {
          type: Sequelize.TEXT,
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
      { tableName: 'medical_reports', schema },
      ['patient_user_id'],
      { name: 'medical_reports_patient_user_id_idx' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'medical_reports', schema });
  },
};
