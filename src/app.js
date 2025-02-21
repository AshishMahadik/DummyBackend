const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const XSS = require('xss-clean');
const morgan = require('morgan');
const passport = require('passport');
const { StatusCodes } = require('http-status-codes');
const cookieparser = require('cookie-parser');
const { ApiError } = require('./utils');
const { errorHandler, errorConverter } = require('./middleware/error');
const { JwtStrategy } = require('./middleware/authentication');
// const { secureApiWithkey } = require('./middleware/apiValidation');

const limiter = require('./config/apiLimit');
const logs = require('./config/morgan');
const appRoutes = require('./routes/index.routes');
const viewRoutes = require('./routes/view.routes');
const { userJwtStrategy } = require('./config/passport');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static('public'));

app.use(
  cors({
    origin: 'http://localhost:5173', // Specific frontend origin (no '*')
    credentials: true, // Allow cookies/auth headers
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());

app.use(XSS());

app.use(cookieparser());

app.use(logs.success);
app.use(logs.error);
app.use(morgan('dev'));

app.use(passport.initialize());
JwtStrategy(passport);

app.use('/', limiter);

app.use('/', viewRoutes);

// app.use(secureApiWithkey);   // Enables once you start with validation
passport.use('userJwt', userJwtStrategy);

app.use('/', appRoutes);

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
