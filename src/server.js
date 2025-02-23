const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./config/logger');

process.on('uncaughtException', (err) => {
  logger.info(err);
  process.exit(1);
});

const app = require('./app');

logger.info(`Node Environment => ${env.env}`);

const DB = env.mongoose.url.replace('<PASSWORD>', env.mongoose.password);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info(`Connected to MongoDB => ${env.mongoose.url}`);
  })
  .catch((err) => {
    logger.info(err);
  });

const server = app.listen(env.Port, () => {
  logger.info(`Node server listening on port => ${env.Port}`);
});

process.on('unhandledRejection', (err) => {
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});
