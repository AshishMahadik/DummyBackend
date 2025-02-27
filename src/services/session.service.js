const { Session } = require('../models');

const createSession = async (payload) => {
  const data = await Session.create(payload);

  return data;
};

module.exports = {
  createSession,
};
