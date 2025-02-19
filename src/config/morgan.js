const morgan = require('morgan');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

morgan.token('date', (req, res, tz) => moment().tz(tz).format('LLLL'));

const responseFormat = '[:date[Asia/Calcutta]] ":method :url" - :status - :response-time ms';

const success = morgan(responseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: fs.createWriteStream(
    path.join(__dirname, '../logs/successRequestLogs.txt'),
    {
      flags: 'a',
    },
  ),
});

const error = morgan(responseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: fs.createWriteStream(
    path.join(__dirname, '../logs/errorRequestLogs.txt'),
    {
      flags: 'a',
    },
  ),
});

module.exports = {
  success,
  error,
};
