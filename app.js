require('dotenv').config();
const createError = require('http-errors');
const path = require('path');
const debug = require('debug')('express-locallibrary-tutorial:app');
const RateLimit = require('express-rate-limit');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');

const app = express();

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

app.use(limiter);

const mongoDB = process.env.MONGODB_URI;
async function main() {
  await mongoose.connect(mongoDB);
}

main().catch((err) => debug(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
