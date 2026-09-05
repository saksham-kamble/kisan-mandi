require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const centreRoutes = require('./routes/centre.routes');
const bookingRoutes = require('./routes/booking.routes');
const queueRoutes = require('./routes/queue.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const mspRoutes = require('./routes/msp.routes');
const jformRoutes = require('./routes/jform.routes');
const landRecordRoutes = require('./routes/landRecord.routes');
const grievanceRoutes = require('./routes/grievance.routes');
const updatesRoutes = require('./routes/updates.routes');
const superAdminRoutes = require('./routes/superAdmin.routes');
const { setupQueueSocket } = require('./socket/queue.socket');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/msp-rates', mspRoutes);
app.use('/api/jform', jformRoutes);
app.use('/api/land-records', landRecordRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/updates', updatesRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const message = err.message || 'Internal Server Error';
  res.status(err.status || 500).json({ error: message });
});

// Socket.IO setup
setupQueueSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌾 Kisan Mandi server running on port ${PORT}`);
});

module.exports = { app, server, io };
