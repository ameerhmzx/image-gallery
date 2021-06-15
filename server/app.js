import express, {json} from 'express';
import logger from 'morgan';
import cors from "cors";
import jwt from "express-jwt";
import compression from 'compression';
import paginate from "express-paginate";
import path from 'path';

import userRouter from './routes/user.js';
import folderRouter from './routes/folder.js';

import dotenv from 'dotenv';

/* Load .env Variables in dev
 * Heroku configVars will be used instead.
 */
if (process.env.NODE_ENV !== "production") {
    dotenv.config({ debug: true });
}

const app = express();

/**
 * Middlewares Configuration
 */
app.use(logger('dev'));
app.use(cors());
app.use(compression());
app.use(json());
app.use(express.urlencoded({ extended: false }));
app.use(jwt({
    secret: process.env.jsecret,
    algorithms: ['HS256'],
    credentialsRequired: false
}));
app.use(paginate.middleware(10, 50));
app.all(function(req, res, next) {
    if (req.query.limit <= 0) req.query.limit = 1;
    next();
});

/**
 * Api Routes
 */
app.use('/api/user', userRouter);
app.use('/api/folder', folderRouter);

/**
 * Error Handler
 */
 app.use(function (err, req, res, next) {
    let status = err.status || 500;
    err = process.env.NODE_ENV === 'production' ? {} : err;

    return res.status(status).json({
        status: 'error',
        error: err,
        message: err.message
    });
});

/**
 * Serving React App
 */
const reactPath = new URL('../app/build', import.meta.url).pathname;
app.use(express.static(reactPath));
app.use('(/*)?', async (req, res, next) => {
    res.sendFile(path.join(reactPath, 'index.html'));
});

export default app;
