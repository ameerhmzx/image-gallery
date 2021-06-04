import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import cors from "cors";
import jwt from "express-jwt";
import compression from 'compression';

import userRouter from './routes/user.js';
import folderRouter from './routes/folder.js';

import dotenv from 'dotenv';

/* Load .env Variables in dev
 * Heroku configVars will be used instead.
 */
if (process.env.NODE_ENV != "production") {
    dotenv.config({ debug: process.env.DEBUG });
}

var app = express();

app.use(logger('dev'));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ limit: '6mb', extended: false }));
app.use(jwt({
    secret: process.env.jsecret,
    algorithms: ['HS256'],
    credentialsRequired: false
}));

app.use('/api/user', userRouter);
app.use('/api/folder', folderRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    var err = process.env.NODE_ENV == 'production' ? {} : err;

    return res.json({
        status: 'error',
        error: err,
        message: err.message
    });
});

export default app;
