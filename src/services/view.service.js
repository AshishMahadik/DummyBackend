const { Email } = require('../models');

/**
 * Find emails with user email
 * @param {string} email - user email addresss
 * @returns {Promise<Email>}
 */

const emailList = async (filter, options) => {
  const emails = await Email.paginate(filter, options);

  return emails;
};

/**
 * Find one email
 * @param {ObjectId} emailId - object id of the email
 * @returns {Promise<Email>}
 */

const emailView = async (emailId) => await Email.findById(emailId);

module.exports = {
  emailList,
  emailView,
};
