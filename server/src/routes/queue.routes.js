const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getLiveQueue, getQueuePosition } = require('../controllers/queue.controller');

const router = Router();

router.get('/:centreId/live', authenticate, getLiveQueue);
router.get('/:centreId/position/:bookingId', authenticate, getQueuePosition);

module.exports = router;
