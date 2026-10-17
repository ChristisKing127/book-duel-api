'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('choices', {
      choice_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: Sequelize.INTEGER, allowNull: false },
      text: { type: Sequelize.STRING(120), allowNull: false },
      position: { type: Sequelize.SMALLINT, allowNull: false },
      is_correct: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
    });
    await queryInterface.addConstraint('choices', {
      fields: ['question_id'], type: 'foreign key', name: 'fk_choices_question', references: { table: 'questions', field: 'question_id' }, onDelete: 'CASCADE'
    });
    await queryInterface.sequelize.query(
      `ALTER TABLE "choices" ADD CONSTRAINT ck_choice_text CHECK (char_length(text) >= 1)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "choices" ADD CONSTRAINT ck_choice_pos CHECK ("position" BETWEEN 0 AND 3)`
    );
    await queryInterface.addConstraint('choices', {
      fields: ['question_id', 'position'], type: 'unique', name: 'uq_choice_position'
    });
    await queryInterface.addIndex('choices', {
      fields: ['question_id'], unique: true, where: { is_correct: true }, name: 'uq_one_correct_choice'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('choices');
  }
};
