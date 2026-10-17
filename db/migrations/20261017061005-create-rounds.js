'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rounds', {
      round_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: Sequelize.INTEGER, allowNull: false },
      question_id: { type: Sequelize.INTEGER, allowNull: false },
      round_no: { type: Sequelize.SMALLINT, allowNull: false },
      status: { type: Sequelize.STRING(6), allowNull: false, defaultValue: 'open' },
      is_voided: { type: Sequelize.BOOLEAN, defaultValue: false },
      started_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      deadline_at: { type: Sequelize.DATE, allowNull: false },
      closed_at: { type: Sequelize.DATE, allowNull: true }
    });
    await queryInterface.addConstraint('rounds', {
      fields: ['session_id'], type: 'foreign key', name: 'fk_rounds_session', references: { table: 'sessions', field: 'session_id' }, onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('rounds', {
      fields: ['question_id'], type: 'foreign key', name: 'fk_rounds_question', references: { table: 'questions', field: 'question_id' }, onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('rounds', {
      fields: ['session_id', 'round_no'], type: 'unique', name: 'uq_round_no'
    });
    await queryInterface.addConstraint('rounds', {
      fields: ['session_id', 'question_id'], type: 'unique', name: 'uq_round_question'
    });
    await queryInterface.sequelize.query(
      `ALTER TABLE "rounds" ADD CONSTRAINT ck_round_no CHECK (round_no >= 1)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "rounds" ADD CONSTRAINT ck_round_status CHECK (status IN ('open','closed'))`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "rounds" ADD CONSTRAINT ck_round_deadline CHECK (deadline_at > started_at)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "rounds" ADD CONSTRAINT ck_round_closed CHECK ((status = 'closed') = (closed_at IS NOT NULL))`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "rounds" ADD CONSTRAINT ck_round_voided CHECK (NOT is_voided OR status = 'closed')`
    );
    await queryInterface.addIndex('rounds', ['session_id'], { unique: true, where: { status: 'open' }, name: 'uq_one_open_round' });
    await queryInterface.addIndex('rounds', ['question_id'], { name: 'idx_rounds_question' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('rounds');
  }
};
