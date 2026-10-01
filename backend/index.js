import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { db } from './src/prisma/db.js';
import { createRequire } from 'module';

// 1. Create a CommonJS require function to bypass ESM strict pathing
const require = createRequire(import.meta.url);
const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils.js');

const wss = new WebSocketServer({ port: 1234 });

// 2. Bind PostgreSQL to the Yjs persistence lifecycle
setPersistence({
  bindState: async (docName, ydoc) => {
    try {
      const existing = await db.orm.public.Document.first({
        roomName: docName
      });

      if (existing && existing.state) {
        console.log(`[DB] Loaded existing document for ${docName} (${existing.state.length} bytes)`);
        Y.applyUpdate(ydoc, new Uint8Array(existing.state));
      } else {
        console.log(`[DB] No existing document found. Starting fresh for ${docName}`);
      }
    } catch (err) {
      console.error('[DB] Error loading document:', err);
    }
  },
  writeState: async (docName, ydoc) => {
    try {
      const state = Buffer.from(Y.encodeStateAsUpdate(ydoc));
      await db.orm.public.Document.upsert({
        create: { roomName: docName, state },
        update: { state },
        conflictOn: { roomName: docName },
      });
      console.log(`[DB] Successfully saved state for ${docName}`);
    } catch (err) {
      console.error('[DB] Failed to save update to database:', err);
    }
  }
});

// 3. Let y-websocket handle the complex sync protocol and awareness data
wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

console.log('WebSocket persistence server running on ws://localhost:1234');