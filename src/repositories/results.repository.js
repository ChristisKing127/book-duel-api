const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function findFinishedGamePlayers(since) {
  const sql = `
    SELECT s.join_code AS session_code,
           s.started_at,
           s.ended_at,
           u.school_id,
           sp.nickname,
           sp.score,
           (
             SELECT COUNT(*)
               FROM answers a
               JOIN rounds r ON r.round_id = a.round_id
              WHERE a.session_player_id = sp.session_player_id
                AND r.is_voided = FALSE
                AND a.answered_at IS NOT NULL
           ) = (
             SELECT COUNT(*)
               FROM rounds r2
              WHERE r2.session_id = s.session_id
                AND r2.is_voided = FALSE
           ) AS completed
      FROM sessions s
      JOIN session_players sp ON sp.session_id = s.session_id
      JOIN users u ON u.user_id = sp.user_id
     WHERE s.status = 'ended'
       AND (CAST(:since AS timestamptz) IS NULL OR s.ended_at > :since)
     ORDER BY s.ended_at, sp.score DESC
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: { since: since ? since.toISOString() : null },
  });
}

module.exports = { findFinishedGamePlayers };