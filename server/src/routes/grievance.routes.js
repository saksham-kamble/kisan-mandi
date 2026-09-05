const { Router } = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const {
  createGrievance,
  getMyGrievances,
  getAllGrievances,
  resolveGrievance,
} = require('../controllers/grievance.controller');

const router = Router();

// Farmer grievance routes
router.post('/', authenticate, createGrievance);
router.get('/mine', authenticate, getMyGrievances);

// Admin grievance management routes
router.get('/admin', authenticate, authorizeAdmin, getAllGrievances);
router.patch('/:id/resolve', authenticate, authorizeAdmin, resolveGrievance);

module.exports = router;
