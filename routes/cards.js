const express = require('express');
const router = express.Router();
const { Card, addCardToDatabase } = require('../models/Card'); // Ensure correct import

// POST route to add a new card
router.post('/cards', async (req, res) => {
  const { userId, cardNumber, expirationDate } = req.body;

  try {
    // Validate input data
    if (!userId || !cardNumber || !expirationDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create a new Card instance
    const newCard = new Card(userId, cardNumber, expirationDate);

    // Call the function to add the card to the database
    const result = await addCardToDatabase(newCard.userId, newCard.cardNumber, newCard.expirationDate);
    res.status(201).json({ cardNumber: newCard.cardNumber });
  } catch (error) {
    console.error('Error saving card:', error);
    res.status(500).json({ message: 'Error saving card', error: error.message });
  }
});

// GET route to retrieve all cards (optional)
router.get('/cards', async (req, res) => {
  try {
    const cards = await Card.find(); // Assuming you have a Card model with a find method
    res.status(200).json(cards);
  } catch (error) {
    console.error('Error retrieving cards:', error);
    res.status(500).json({ message: 'Error retrieving cards', error: error.message });
  }
});

// Export the router
module.exports = router;
