'use strict';

const schema = process.env.DB_SCHEMA || 'doctorbook_schema';

const SPECIALIZATIONS = [
  { name: 'General Physician', description: 'Primary care and general medical consultation' },
  { name: 'Cardiologist', description: 'Heart and cardiovascular system' },
  { name: 'Dermatologist', description: 'Skin, hair, and nail conditions' },
  { name: 'Pediatrician', description: 'Child and adolescent health' },
  { name: 'Orthopedic', description: 'Bones, joints, and musculoskeletal system' },
  { name: 'Gynecologist', description: 'Women’s reproductive health' },
  { name: 'Neurologist', description: 'Brain and nervous system' },
  { name: 'ENT Specialist', description: 'Ear, nose, and throat' },
  { name: 'Psychiatrist', description: 'Mental health and behavioral disorders' },
  { name: 'Dentist', description: 'Oral and dental care' },
  { name: 'Ophthalmologist', description: 'Eye care and vision' },
  { name: 'Diabetologist', description: 'Diabetes and metabolic disorders' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      { tableName: 'specializations', schema },
      SPECIALIZATIONS.map((item) => ({
        ...item,
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      { tableName: 'specializations', schema },
      {
        name: SPECIALIZATIONS.map((s) => s.name),
      }
    );
  },
};
