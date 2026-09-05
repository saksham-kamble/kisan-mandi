/**
 * Socket.IO queue event handlers
 */
const setupQueueSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a procurement centre's queue room
    socket.on('queue:join', ({ centreId }) => {
      const room = `centre-${centreId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Leave a procurement centre's queue room
    socket.on('queue:leave', ({ centreId }) => {
      const room = `centre-${centreId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupQueueSocket };
