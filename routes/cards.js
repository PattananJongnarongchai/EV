const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// Initialize cards
router.post('/initialize', async (req, res) => {
  try {
    // Clear existing cards
    await Card.deleteMany({});
    
    // Create two new cards
    const cards = await Card.insertMany([
      { cardId: 'CARD001' },
      { cardId: 'CARD002' }
    ]);
    
    res.status(201).json(cards);
  } catch (err) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการสร้างบัตรเริ่มต้น' });
  }
});

// Get all cards
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัตร' });
  }
});

// Create a new card
router.post('/', async (req, res) => {
  const card = new Card({
    cardId: req.body.cardId
  });

  try {
    const newCard = await card.save();
    res.status(201).json(newCard);
  } catch (err) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการสร้างบัตรใหม่' });
  }
});

// Update card availability
router.patch('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (card) {
      card.isAvailable = req.body.isAvailable;
      card.currentUser = req.body.currentUser;
      const updatedCard = await card.save();
      res.json(updatedCard);
    } else {
      res.status(404).json({ message: 'ไม่พบบัตรที่ระบุ' });
    }
  } catch (err) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะบัตร' });
  }
});

module.exports = router; 