'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      session_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      host_id: { type: Sequelize.INTEGER, allowNull: false },
      question_set_id: { type: Sequelize.INTEGER, allowNull: false },
      join_code: { type: Sequelize.STRING(6), allowNull: false },
      status: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'waiting' },
      end_reason: { type: Sequelize.STRING(25), allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      started_at: { type: Sequelize.DATE, allowNull: true },
      ended_at: { type: Sequelize.DATE, allowNull: true }
    });
    await queryInterface.addConstraint('sessions', {
      fields: ['host_id'], type: 'foreign key', name: 'fk_sessions_host', references: { table: 'users', field: 'user_id' }, onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('sessions', {
      fields: ['question_set_id'], type: 'foreign key', name: 'fk_sessions_set', references: { table: 'question_sets', field: 'question_set_id' }, onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('sessions', {
      fields: ['join_code'], type: 'unique', name: 'uq_session_join_code'
    });
    await queryInterface.sequelize.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT ck_join_code CHECK (join_code ~ '^[1-9][0-9]{5}$')`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT ck_session_status CHECK (status IN ('waiting','playing','ended'))`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT ck_end_reason CHECK (end_reason IS NULL OR end_reason IN ('last_player_standing','questions_ran_out','host_ended'))`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT ck_ended_reason CHECK ((status = 'ended') = (end_reason IS NOT NULL))`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT ck_ended_at CHECK ((status = 'ended') = (ended_at IS NOT NULL))`
    );
    await queryInterface.addIndex('sessions', ['host_id'], { name: 'idx_sessions_host' });
    await queryInterface.addIndex('sessions', ['question_set_id'], { name: 'idx_sessions_set' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('sessions');
  }
};
