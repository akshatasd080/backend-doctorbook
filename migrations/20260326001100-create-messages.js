'use strict';

const schema = process.env.DB_SCHEMA || 'doctorbook_schema';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'messages', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        conversation_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: 'conversations', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        sender_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: 'users', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        message_type: {
          type: Sequelize.ENUM(
            'text',
            'image',
            'file',
            'prescription',
            'report'
          ),
          allowNull: false,
          defaultValue: 'text',
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        file_path: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        prescription_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: 'prescriptions', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        medical_report_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: 'medical_reports', schema },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
      { tableName: 'messages', schema },
      ['conversation_id', 'created_at'],
      { name: 'messages_conversation_created_idx' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'messages', schema });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "${schema}"."enum_messages_message_type";`
    );
  },
};
