const express = require('express');
const router = express.Router();
const Usage = require('../models/Usage');
const Card = require('../models/Card');

// Start card usage
router.post('/start', async (req, res) => {
  try {
    const card = await Card.findOne({ cardId: req.body.cardId });
    if (!card) {
      return res.status(404).json({ message: 'ไม่พบบัตรที่ระบุ' });
    }
    if (!card.isAvailable) {
      return res.status(400).json({ message: 'บัตรนี้กำลังถูกใช้งานอยู่' });
    }

    const usage = new Usage({
      cardId: card._id,
      memberName: req.body.memberName,
      startDate: new Date(),
      startTime: new Date(),
      hourlyRate: req.body.hourlyRate
    });

    const newUsage = await usage.save();
    
    card.isAvailable = false;
    card.currentUser = newUsage._id;
    await card.save();

    res.status(201).json(newUsage);
  } catch (err) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการเริ่มการใช้งาน' });
  }
});

// End card usage
router.post('/end/:id', async (req, res) => {
  try {
    const usage = await Usage.findById(req.params.id);
    if (!usage) {
      return res.status(404).json({ message: 'ไม่พบประวัติการใช้งาน' });
    }

    const endTime = new Date();
    const duration = (endTime - usage.startTime) / (1000 * 60 * 60); // Convert to hours
    const totalCost = duration * usage.hourlyRate;

    usage.endTime = endTime;
    usage.totalCost = totalCost;
    await usage.save();

    // Update card availability
    const card = await Card.findById(usage.cardId);
    card.isAvailable = true;
    card.currentUser = null;
    await card.save();

    res.json(usage);
  } catch (err) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการสิ้นสุดการใช้งาน' });
  }
});

// Get all usage records
router.get('/', async (req, res) => {
  try {
    const usages = await Usage.find().populate('cardId');
    res.json(usages);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการใช้งาน' });
  }
});

module.exports = router; 