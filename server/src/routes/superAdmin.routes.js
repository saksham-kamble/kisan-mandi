const { Router } = require('express');
const { authenticate, authorizeSuperAdmin } = require('../middleware/auth');
const {
  getSuperAdminStats,
  getMandiReports,
  resolveSuperAdminGrievance,
  getCentresAudit,
} = require('../controllers/superAdmin.controller');

const router = Router();

// Strict Super Admin Access
router.use(authenticate, authorizeSuperAdmin);

router.get('/stats', getSuperAdminStats);
router.get('/mandi-reports', getMandiReports);
router.patch('/grievances/:id', resolveSuperAdminGrievance);
router.get('/centres-audit', getCentresAudit);

module.exports = router;
