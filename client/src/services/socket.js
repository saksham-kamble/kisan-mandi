import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinQueueRoom = (centreId) => {
  socket.emit('queue:join', { centreId });
};

export const leaveQueueRoom = (centreId) => {
  socket.emit('queue:leave', { centreId });
};

export const onQueueUpdate = (callback) => {
  socket.on('queue:updated', callback);
};

export const offQueueUpdate = () => {
  socket.off('queue:updated');
};

export default socket;
