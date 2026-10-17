'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('session_players', {
      session_player_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: Sequelize.INTEGER, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      nickname: { type: Sequelize.STRING(20), allowNull: false },
      hp: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 5 },
      score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_eliminated: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_winner: { type: Sequelize.BOOLEAN, defaultValue: false },
      joined_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') }
    });
    await queryInterface.addConstraint('session_players', {
      fields: ['session_id'], type: 'foreign key', name: 'fk_session_players_session', references: { table: 'sessions', field: 'session_id' }, onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('session_players', {
      fields: ['user_id'], type: 'foreign key', name: 'fk_session_players_user', references: { table: 'users', field: 'user_id' }, onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('session_players', {
      fields: ['session_id', 'user_id'], type: 'unique', name: 'uq_one_seat'
    });
    await queryInterface.addConstraint('session_players', {
      fields: ['session_id', 'nickname'], type: 'unique', name: 'uq_player_nickname'
    });
    await queryInterface.sequelize.query(
      `ALTER TABLE "session_players" ADD CONSTRAINT ck_player_nickname CHECK (char_length(nickname) >= 2)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "session_players" ADD CONSTRAINT ck_player_hp CHECK (hp BETWEEN 0 AND 5)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "session_players" ADD CONSTRAINT ck_player_score CHECK (score >= 0)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "session_players" ADD CONSTRAINT ck_eliminated_hp CHECK (is_eliminated = (hp = 0))`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "session_players" ADD CONSTRAINT ck_winner_alive CHECK (NOT (is_winner AND is_eliminated))`
    );
    await queryInterface.addIndex('session_players', ['user_id'], { name: 'idx_players_user' });
    await queryInterface.addIndex('session_players', ['session_id', 'hp', 'score'], { name: 'idx_players_leaderboard', order: [['hp', 'DESC'], ['score', 'DESC']] });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('session_players');
  }
};
