'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('question_sets', {
      question_set_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      host_id: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING(80), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: true },
      subject: { type: Sequelize.STRING(60), allowNull: true },
      grade_level: { type: Sequelize.STRING(30), allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') }
    });
    await queryInterface.addConstraint('question_sets', {
      fields: ['host_id'], type: 'foreign key', name: 'fk_sets_host', references: { table: 'users', field: 'user_id' }, onDelete: 'CASCADE'
    });
    await queryInterface.sequelize.query(
      `ALTER TABLE "question_sets" ADD CONSTRAINT ck_set_title CHECK (char_length(title) >= 3)`
    );
    await queryInterface.addIndex('question_sets', ['host_id'], { name: 'idx_question_sets_host' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('question_sets');
  }
};

