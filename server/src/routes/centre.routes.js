const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getCentres, getCentre, getCentreSlots } = require('../controllers/centre.controller');

const router = Router();

router.get('/', authenticate, getCentres);
router.get('/:id', authenticate, getCentre);
router.get('/:id/slots', authenticate, getCentreSlots);

module.exports = router;
