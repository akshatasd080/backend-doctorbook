'use strict';

const schema = process.env.DB_SCHEMA || 'doctorbook_schema';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'doctor_profiles', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: { tableName: 'users', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        specialization_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: 'specializations', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        qualifications: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        medical_registration_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        years_of_experience: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        hospital_clinic_name: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        hospital_clinic_address: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        consultation_fee: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        bio: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        approval_status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
        },
        rejection_reason: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        submitted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        reviewed_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        reviewed_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: 'users', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
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
      { tableName: 'doctor_profiles', schema },
      ['approval_status'],
      { name: 'doctor_profiles_approval_status_idx' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'doctor_profiles', schema });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "${schema}"."enum_doctor_profiles_approval_status";`
    );
  },
};
