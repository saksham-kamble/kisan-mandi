const { Router } = require('express');
const { getMSPRates, getRateForCommodity } = require('../controllers/msp.controller');

const router = Router();

router.get('/', getMSPRates);
router.get('/:commodity', getRateForCommodity);

module.exports = router;
