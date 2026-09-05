const { Router } = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { getUpdates, createUpdate, deleteUpdate } = require('../controllers/updates.controller');

const router = Router();

// Public / Farmer access to view updates & advisories
router.get('/', getUpdates);

// Admin / Super Admin actions to manage broadcasts
router.post('/', authenticate, authorizeAdmin, createUpdate);
router.delete('/:id', authenticate, authorizeAdmin, deleteUpdate);

module.exports = router;
