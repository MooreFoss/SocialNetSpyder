const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDB = require('./config/db'); // 导入数据库连接文件

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login'); // 引用新的 login.js 路由文件
const manageRouter = require('./routes/manage'); // 引用新的 manage.js 路由文件

const app = express();

connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter); // 使用新的 login.js 路由文件
app.use('/manage', manageRouter); // 使用新的 manage.js 路由文件

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).render('404');
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;