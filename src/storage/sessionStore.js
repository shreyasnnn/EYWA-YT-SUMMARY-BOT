const sessions = new Map();

function getSession(chatId) {
  return sessions.get(chatId);
}

function setSession(chatId, data) {
  sessions.set(chatId, data);
}

function updateSession(chatId, updates) {
  const existing = sessions.get(chatId) || {};
  sessions.set(chatId, { ...existing, ...updates });
}

module.exports = {
  getSession,
  setSession,
  updateSession,
};