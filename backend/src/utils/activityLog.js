const db = require("../config/db");

async function createActivityLog({
  targetUserId,
  actorUserId = null,
  action,
  oldValue = null,
  newValue = null,
  message,
}) {
  await db.query(
    `
    INSERT INTO user_activity_logs (
      target_user_id,
      actor_user_id,
      action,
      old_value,
      new_value,
      message
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [targetUserId, actorUserId, action, oldValue, newValue, message],
  );
}

module.exports = {
  createActivityLog,
};
