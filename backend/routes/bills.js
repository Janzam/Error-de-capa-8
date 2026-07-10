const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: "Error fetching bills" });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { month, amount, dueDate, kwh } = req.body;
    const bill = await prisma.bill.create({
      data: {
        userId: req.user.userId,
        month,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        kwh: Number(kwh)
      }
    });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: "Error creating bill" });
  }
});

router.put('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await prisma.bill.update({
      where: { id },
      data: { status: "pagada" }
    });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: "Error updating bill" });
  }
});

module.exports = router;
