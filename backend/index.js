import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.info(JSON.stringify({
    level: 'info',
    event: 'ws_connection_established',
    ip: req.socket.remoteAddress,
    timestamp: new Date().toISOString()
  }));
  
  setupWSConnection(ws, req);
  
  ws.on('close', () => {
    console.info(JSON.stringify({
      level: 'info',
      event: 'ws_connection_closed',
      ip: req.socket.remoteAddress,
      timestamp: new Date().toISOString()
    }));
  });
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.info(JSON.stringify({
    level: 'info',
    event: 'server_started',
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  }));
});