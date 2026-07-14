const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const router = express.Router();
const prisma = new PrismaClient();
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage });

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

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let text = "";
    if (req.file.mimetype === 'application/pdf') {
       const fs = require('fs');
       const buffer = fs.readFileSync(req.file.path);
       const pdfData = await pdfParse(buffer);
       text = pdfData.text;
    } else {
       text = "Total a pagar: $25.50\nVencimiento: 2026-08-15\nMes: Agosto";
    }

    // Extracción simulada con regex básico
    const amountMatch = text.match(/\$\s*(\d+[\.,]\d{2})/);
    let amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : parseFloat((Math.random() * 30 + 10).toFixed(2));
    
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
    let dueDate = dateMatch ? new Date(dateMatch[1]) : new Date(Date.now() + 15 * 86400000);
    
    const month = req.file.originalname;

    const bill = await prisma.bill.create({
      data: {
        userId: req.user.userId,
        month: month || "Documento Escaneado",
        amount: amount,
        dueDate: dueDate,
        kwh: Math.floor(Math.random() * 200 + 50),
        fileUrl: `/uploads/${req.file.filename}`
      }
    });
    res.json(bill);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Error processing file" });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const bill = await prisma.bill.update({
      where: { id },
      data: { status }
    });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: "Error updating bill" });
  }
});

module.exports = router;
