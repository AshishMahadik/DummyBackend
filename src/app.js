const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const XSS = require('xss-clean');
const morgan = require('morgan');
const passport = require('passport');
const { StatusCodes } = require('http-status-codes');
const { ApiError } = require('./utils');
const { errorHandler, errorConverter } = require('./middleware/error');
const { JwtStrategy } = require('./middleware/authentication');
// const { secureApiWithkey } = require('./middleware/apiValidation');

const limiter = require('./config/apiLimit');
const logs = require('./config/morgan');
const appRoutes = require('./routes/index.routes');
const viewRoutes = require('./routes/view.routes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static('public'));

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());

app.use(XSS());

app.use(logs.success);
app.use(logs.error);
app.use(morgan('dev'));

app.use(passport.initialize());
JwtStrategy(passport);

app.use('/', limiter);

app.use('/', viewRoutes);

// app.use(secureApiWithkey);   // Enables once you start with validation

app.use('/app', appRoutes);

app.all('*', (req, res, next) => {
  next(
    new ApiError(
      `Can't find ${req.originalUrl} on this server`,
      StatusCodes.BAD_REQUEST,
    ),
  );
});

app.use(errorConverter);

app.use(errorHandler);

module.exports = app;
