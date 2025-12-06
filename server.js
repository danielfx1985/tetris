const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('NEON TETRIS LAN SERVER STARTED ON PORT 8080');
console.log('To connect from another computer, use your local IP address (e.g., ws://192.168.1.5:8080)');

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    // Broadcast the message to all other connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
  
  ws.on('error', (err) => {
      console.error('Client error:', err);
  });
});
