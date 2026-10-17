'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      user_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_id: { type: Sequelize.STRING(20), allowNull: false },
      full_name: { type: Sequelize.STRING(100), allowNull: false },
      username: { type: Sequelize.STRING(40), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false },
      password_hash: { type: Sequelize.STRING(60), allowNull: false },
      role: { type: Sequelize.STRING(10), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') }
    });

    await queryInterface.addConstraint('users', { fields: ['school_id'], type: 'unique', name: 'uq_user_school_id' });
    await queryInterface.addConstraint('users', { fields: ['username'], type: 'unique', name: 'uq_user_username' });
    await queryInterface.addConstraint('users', { fields: ['email'], type: 'unique', name: 'uq_user_email' });

    await queryInterface.sequelize.query(
      `ALTER TABLE "users" ADD CONSTRAINT ck_user_username CHECK (char_length(username) >= 3)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "users" ADD CONSTRAINT ck_user_role CHECK (role IN ('host','player'))`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "users" ADD CONSTRAINT ck_user_full_name CHECK (char_length(full_name) >= 1)`
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
