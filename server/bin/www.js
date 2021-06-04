#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../app.js';
import http from 'http';
import fadmin from 'firebase-admin';
import mongoose from 'mongoose';

// Initialize firebase admin
console.log("[storage] connecting...");
var secret = JSON.parse(process.env.firebase_json);
fadmin.initializeApp({
  credential: fadmin.credential.cert(secret),
  storageBucket: process.env.BUCKET_URL
});
app.locals.bucket = fadmin.storage().bucket()
console.log("[storage] connected.");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Connect to DB then Start Server.
 */
console.log(`[db] connecting...`);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(`mongodb+srv://${process.env.mongo_user}:${process.env.mongo_pass}@${process.env.mongo_host}/gallery?retryWrites=true&w=majority`, {
  "auth": {
    "authSource": "admin"
  },
}).then(() => {
  console.log('[db] connected.');
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

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

  var bind = typeof port === 'string'
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
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}