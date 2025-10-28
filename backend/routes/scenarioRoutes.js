const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenarioController');
const { authenticate } = require('../middlewares/auth');

// All scenario routes require authentication
router.use(authenticate);

// Scenario CRUD operations
router.post('/scenarios', scenarioController.createScenario);
router.get('/scenarios', scenarioController.getScenarios);
router.get('/scenarios/:scenarioId', scenarioController.getScenario);
router.delete('/scenarios/:scenarioId', scenarioController.deleteScenario);

// Activity operations
router.post('/scenarios/:scenarioId/activities', scenarioController.addActivity);
router.put('/activities/:activityId', scenarioController.updateActivity);
router.delete('/activities/:activityId', scenarioController.deleteActivity);

// Utility endpoints
router.get('/emission-factors', scenarioController.getEmissionFactors);
router.post('/calculate-preview', scenarioController.calculatePreview);
router.get('/leaderboard', scenarioController.getLeaderboard);
router.get('/social/milestones', scenarioController.getMilestones);
router.post('/social/motivation', scenarioController.getCarbonMotivation);
router.post('/social/chat', scenarioController.carbonChat);
router.get('/stats/summary', scenarioController.getUserStats);
router.get('/stats/weekly-chart', scenarioController.getWeeklyChart);
router.get('/stats/weekly-comparison', scenarioController.getWeeklyComparison);
// User report (JSON + PDF)
router.get('/me/report', scenarioController.getMyReport);
router.get('/me/report/pdf', scenarioController.getMyReportPdf);

module.exports = router;
