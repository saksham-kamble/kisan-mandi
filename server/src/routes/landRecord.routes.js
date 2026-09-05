const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getMyLandRecords,
  getQuotaForCommodity,
  addLandRecord,
  updateLandRecord,
  deleteLandRecord,
} = require('../controllers/landRecord.controller');

const router = Router();

router.use(authenticate);

router.get('/', getMyLandRecords);
router.get('/quota/:commodity', getQuotaForCommodity);
router.post('/', addLandRecord);
router.put('/:id', updateLandRecord);
router.delete('/:id', deleteLandRecord);

module.exports = router;
