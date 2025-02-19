const { StatusCodes } = require('http-status-codes');
const env = require('../env');
const { ApiError } = require('../utils');

const secureApiWithkey = (req, res, next) => {
  const key = req.query.API_KEY;

  if (key !== env.secretKey) {
    throw new ApiError('Please provide Api Key', StatusCodes.UNAUTHORIZED);
  }

  next();
};

module.exports = {
  secureApiWithkey,
};
