/*
 ** Copyright (C) 2021 KunoiSayami
 **
 ** This file is part of 1092-node-0528 under
 ** the AGPL v3 License: https://www.gnu.org/licenses/agpl-3.0.txt
 **
 ** This program is free software: you can redistribute it and/or modify
 ** it under the terms of the GNU Affero General Public License as published by
 ** the Free Software Foundation, either version 3 of the License, or
 ** any later version.
 **
 ** This program is distributed in the hope that it will be useful,
 ** but WITHOUT ANY WARRANTY; without even the implied warranty of
 ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 ** GNU Affero General Public License for more details.
 **
 ** You should have received a copy of the GNU Affero General Public License
 ** along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import express from 'express';
import path from 'path';
//import cookieParser from 'cookie-parser';
import logger from 'morgan';
//import body from 'body-parser';
import nunjucks from 'nunjucks';

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// Check server is running under development mode
let dev_mode = process.argv.includes('--dev');
if (dev_mode) {
    console.debug('Server running in dev mode');
}

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: dev_mode,
});
if (!(process.argv.includes('--disable-logger') || process.env.LOGGER_DISABLED)) {
    app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


// Set listen port from configure file OR environment OR default 8000
module.exports
export default app;