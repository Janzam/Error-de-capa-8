const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all appliances for the user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const appliances = await prisma.appliance.findMany({
      where: { userId: req.user.userId },
      include: { history: { orderBy: { recordedAt: 'asc' }, take: 12 } }
    });
    res.json(appliances);
  } catch (error) {
    res.status(500).json({ error: "Error fetching appliances" });
  }
});

// Add a new appliance
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type, watts, hoursUse } = req.body;
    
    const appliance = await prisma.appliance.create({
      data: {
        userId: req.user.userId,
        name,
        type,
        watts: Number(watts),
        hoursUse: Number(hoursUse)
      }
    });

    // Seed initial history
    const baseWatts = appliance.watts;
    for (let i = 0; i < 12; i++) {
      await prisma.applianceHistory.create({
         data: {
           applianceId: appliance.id,
           watts: Math.max(0, Math.round(baseWatts * (0.85 + Math.random() * 0.3))),
           recordedAt: new Date(Date.now() - (11 - i) * 10000)
         }
      });
    }

    const created = await prisma.appliance.findUnique({
      where: { id: appliance.id },
      include: { history: { orderBy: { recordedAt: 'asc' }, take: 12 } }
    });

    res.json(created);
  } catch (error) {
    res.status(500).json({ error: "Error creating appliance" });
  }
});

// Delete an appliance
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.applianceHistory.deleteMany({ where: { applianceId: id } });
    await prisma.appliance.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error deleting appliance" });
  }
});

module.exports = router;
