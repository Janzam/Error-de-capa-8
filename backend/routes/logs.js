const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const logs = await prisma.currentLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { recordedAt: 'desc' },
      take: 20
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error fetching logs" });
  }
});

// Calculate current log manually
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const appliances = await prisma.appliance.findMany({
      where: { userId: req.user.userId, status: { not: 'off' } }
    });

    const totalWatts = appliances.reduce((sum, app) => sum + app.watts, 0);
    // Simple calc A = W / 120V
    const amps = totalWatts / 120;

    const log = await prisma.currentLog.create({
      data: {
        userId: req.user.userId,
        amps: amps + (Math.random() * 1.5) // adding slight noise for realism
      }
    });

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: "Error calculating log" });
  }
});

module.exports = router;
