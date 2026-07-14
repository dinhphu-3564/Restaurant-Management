const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');
const { requireAuth, requireManagerOrAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', requireAuth, requireManagerOrAdmin, revenueController.getDashboardStats);
router.get('/advanced-dashboard', requireAuth, requireManagerOrAdmin, revenueController.getAdvancedDashboardData);
router.get('/chart', requireAuth, requireManagerOrAdmin, revenueController.getRevenueChart);
router.get('/report', requireAuth, requireManagerOrAdmin, revenueController.getDetailedReport);

module.exports = router;
