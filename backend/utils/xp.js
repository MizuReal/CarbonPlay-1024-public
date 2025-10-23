const db = require('../config/database');

// Ensure the user_xp table exists; create it if missing
async function ensureXpTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_xp (
      user_id INT NOT NULL PRIMARY KEY,
      xp_total INT NOT NULL DEFAULT 0,
      last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_xp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// Add XP to a user (creates row if not present)
async function addXp(userId, amount) {
  if (!userId || !Number.isFinite(Number(amount))) return;
  await ensureXpTable();
  await db.query(
    `INSERT INTO user_xp (user_id, xp_total) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE xp_total = xp_total + VALUES(xp_total), last_updated = NOW()`,
    [userId, Math.floor(Number(amount))]
  );
}

// Fetch XP summary for a user
async function getXp(userId) {
  await ensureXpTable();
  const [rows] = await db.query('SELECT xp_total, last_updated FROM user_xp WHERE user_id = ?', [userId]);
  if (!rows.length) return { xp_total: 0, last_updated: null };
  return rows[0];
}

module.exports = { ensureXpTable, addXp, getXp };
