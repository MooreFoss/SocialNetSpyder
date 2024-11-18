const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDB = require('./config/db');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const manageRouter = require('./routes/manage/index'); // 确保这一行存在
const logoutRouter = require('./routes/logout');
const registerRouter = require('./routes/register');
const shareRouter = require('./routes/share');

const app = express();

connectDB();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/manage', manageRouter); // 确保这一行存在
app.use('/logout', logoutRouter);
app.use('/register', registerRouter);
app.use('/s', shareRouter);

app.use(function (req, res, next) {
  res.status(404).render('404');
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;