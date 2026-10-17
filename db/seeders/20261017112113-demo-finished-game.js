'use strict';

const HASH = '$2b$10$' + 'x'.repeat(53); // fictitious, exactly 60 chars

module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;
    const id = async (sql, replacements) => {
      const [rows] = await db.query(sql, { replacements });
      return rows[0].id;
    };

    // 1. users (6): 1 host, 4 players, 1 account that never joins (awkward case)
    await queryInterface.bulkInsert('users', [
      { school_id: '2098-0001', username: 'host_sample',   email: 'host.sample@bookduel.test',   password_hash: HASH, role: 'host',   full_name: 'Sample Host' },
      { school_id: '2098-2001', username: 'student_alpha', email: 'student.alpha@bookduel.test', password_hash: HASH, role: 'player', full_name: 'Student Alpha' },
      { school_id: '2098-2002', username: 'student_beta',  email: 'student.beta@bookduel.test',  password_hash: HASH, role: 'player', full_name: 'Student Beta' },
      { school_id: '2098-2003', username: 'student_gamma', email: 'student.gamma@bookduel.test', password_hash: HASH, role: 'player', full_name: 'Student Gamma' },
      { school_id: '2098-2004', username: 'student_delta', email: 'student.delta@bookduel.test', password_hash: HASH, role: 'player', full_name: 'Student Delta' },
      { school_id: '2098-2005', username: 'no_show',       email: 'no.show@bookduel.test',       password_hash: HASH, role: 'player', full_name: 'No Show' },
    ]);
    const userId = (sid) => id('SELECT user_id AS id FROM users WHERE school_id = :sid', { sid });
    const hostId = await userId('2098-0001');

    // 2. question set, questions, choices
    await queryInterface.bulkInsert('question_sets', [
      { host_id: hostId, title: 'Sample Science Set', description: 'Fictitious sample set', subject: 'Science', grade_level: 'Senior High' },
    ]);
    const setId = await id('SELECT question_set_id AS id FROM question_sets WHERE title = :t', { t: 'Sample Science Set' });

    await queryInterface.bulkInsert('questions', [
      { question_set_id: setId, text: 'Which planet is known as the Red Planet?',          type: 'multiple_choice', time_limit_sec: 30, position: 1 },
      { question_set_id: setId, text: 'Which gas do plants absorb for photosynthesis?',    type: 'multiple_choice', time_limit_sec: 30, position: 2 },
    ]);
    const qId = (pos) => id('SELECT question_id AS id FROM questions WHERE question_set_id = :s AND position = :p', { s: setId, p: pos });
    const q1 = await qId(1);
    const q2 = await qId(2);

    await queryInterface.bulkInsert('choices', [
      { question_id: q1, text: 'Venus',          position: 0, is_correct: false },
      { question_id: q1, text: 'Jupiter',        position: 1, is_correct: false },
      { question_id: q1, text: 'Mars',           position: 2, is_correct: true },
      { question_id: q2, text: 'Oxygen',         position: 0, is_correct: false },
      { question_id: q2, text: 'Carbon dioxide', position: 1, is_correct: true },
      { question_id: q2, text: 'Nitrogen',       position: 2, is_correct: false },
    ]);
    const choiceId = (q, pos) => id('SELECT choice_id AS id FROM choices WHERE question_id = :q AND position = :p', { q, p: pos });

    // 3. one ended game
    await queryInterface.bulkInsert('sessions', [{
      host_id: hostId, question_set_id: setId, join_code: '735291',
      status: 'ended', end_reason: 'questions_ran_out',
      started_at: new Date('2026-10-16T02:00:00Z'), ended_at: new Date('2026-10-16T02:06:00Z'),
    }]);
    const sessionId = await id('SELECT session_id AS id FROM sessions WHERE join_code = :c', { c: '735291' });

    // 4. seats: P1 5hp/300, P2 4hp/150, P3 4hp/150 (tie), P4 3hp/0 (did not complete)
    const seats = [
      { sid: '2098-2001', nickname: 'Mika', hp: 5, score: 300, is_winner: true },
      { sid: '2098-2002', nickname: 'Jun',  hp: 4, score: 150, is_winner: false },
      { sid: '2098-2003', nickname: 'Ces',  hp: 4, score: 150, is_winner: false },
      { sid: '2098-2004', nickname: 'Tin',  hp: 3, score: 0,   is_winner: false },
    ];
    for (const s of seats) {
      await queryInterface.bulkInsert('session_players', [{
        session_id: sessionId, user_id: await userId(s.sid), nickname: s.nickname,
        hp: s.hp, score: s.score, is_eliminated: false, is_winner: s.is_winner,
      }]);
    }
    const playerId = (nickname) => id('SELECT session_player_id AS id FROM session_players WHERE session_id = :s AND nickname = :n', { s: sessionId, n: nickname });

    // 5. rounds (closed)
    await queryInterface.bulkInsert('rounds', [
      { session_id: sessionId, question_id: q1, round_no: 1, status: 'closed', is_voided: false,
        started_at: new Date('2026-10-16T02:02:00Z'), deadline_at: new Date('2026-10-16T02:02:30Z'), closed_at: new Date('2026-10-16T02:02:30Z') },
      { session_id: sessionId, question_id: q2, round_no: 2, status: 'closed', is_voided: false,
        started_at: new Date('2026-10-16T02:04:00Z'), deadline_at: new Date('2026-10-16T02:04:30Z'), closed_at: new Date('2026-10-16T02:04:30Z') },
    ]);
    const roundId = (no) => id('SELECT round_id AS id FROM rounds WHERE session_id = :s AND round_no = :n', { s: sessionId, n: no });
    const r1 = await roundId(1);
    const r2 = await roundId(2);

    // 6. answers: [round, nickname, question, picked position or null, correct, answered_at]
    const t1 = new Date('2026-10-16T02:02:12Z');
    const t2 = new Date('2026-10-16T02:04:14Z');
    const plan = [
      [r1, 'Mika', q1, 2, true,  t1], [r2, 'Mika', q2, 1, true,  t2],
      [r1, 'Jun',  q1, 2, true,  t1], [r2, 'Jun',  q2, 0, false, t2],
      [r1, 'Ces',  q1, 0, false, t1], [r2, 'Ces',  q2, 1, true,  t2],
      [r1, 'Tin',  q1, 0, false, t1], [r2, 'Tin',  q2, null, false, null], // no answer
    ];
    for (const [r, nick, q, pos, ok, at] of plan) {
      const answered = pos !== null;
      await queryInterface.bulkInsert('answers', [{
        round_id: r,
        session_player_id: await playerId(nick),
        choice_id: answered ? await choiceId(q, pos) : null,
        is_correct: ok,
        damage_taken: ok ? 0 : 1,
        score_earned: ok ? 150 : 0,
        answered_at: answered ? at : null,
      }]);
    }
  },

  async down(queryInterface) {
    const db = queryInterface.sequelize;
    // sessions first (cascades seats, rounds, answers), then sets, then users
    await db.query("DELETE FROM sessions WHERE join_code = '735291'");
    await db.query("DELETE FROM question_sets WHERE title = 'Sample Science Set'");
    await db.query("DELETE FROM users WHERE school_id LIKE '2098-%'");
  },
};