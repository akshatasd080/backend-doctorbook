'use strict';

const schema = process.env.DB_SCHEMA || 'doctorbook_schema';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'appointments', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
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
        slot_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: { tableName: 'availability_slots', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        status: {
          type: Sequelize.ENUM(
            'booked',
            'confirmed',
            'completed',
            'cancelled',
            'no_show'
          ),
          allowNull: false,
          defaultValue: 'booked',
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        cancelled_by: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        cancel_reason: {
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
      { tableName: 'appointments', schema },
      ['patient_user_id'],
      { name: 'appointments_patient_user_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'appointments', schema },
      ['doctor_profile_id'],
      { name: 'appointments_doctor_profile_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'appointments', schema },
      ['status'],
      { name: 'appointments_status_idx' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'appointments', schema });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "${schema}"."enum_appointments_status";`
    );
  },
};
