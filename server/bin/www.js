#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../app.js';
import http from 'http';
import admin from 'firebase-admin';
import mongoose from 'mongoose';

// Initialize firebase admin
console.log("[storage] connecting...");
let secret = JSON.parse(process.env.firebase_json);
admin.initializeApp({
    credential: admin.credential.cert(secret),
    storageBucket: process.env.BUCKET_URL
});
app.locals.bucket = admin.storage().bucket()
console.log("[storage] connected.");

/**
 * Get port from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Connect to DB then Start Server.
 */
console.log(`[db] connecting...`);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('[db] connected.');
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
});

mongoose.connect(`mongodb+srv://${process.env.mongo_user}:${process.env.mongo_pass}@${process.env.mongo_host}/gallery?retryWrites=true&w=majority`, {
    "auth": {
        "authSource": "admin"
    },
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port))
        return val;

    if (port >= 0)
        return port;

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let address = server.address();
    let bind = typeof address === 'string'
        ? 'pipe ' + address
        : 'port ' + address.port;
    console.log('Listening on ' + bind);
}