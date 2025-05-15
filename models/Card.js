// models/Card.js

// Remove mongoose import
// const mongoose = require('mongoose');

// Define the Card structure
class Card {
  constructor(userId, cardNumber, expirationDate) {
    this.userId = userId;
    this.cardNumber = cardNumber;
    this.expirationDate = expirationDate;
    this.isAvailable = true; // Default value
  }
}

// Function to add a card to the database
const addCardToDatabase = async (userId, cardNumber, expirationDate) => {
  const sql = "INSERT INTO Cards (user_id, card_number, expiration_date) VALUES (?, ?, ?)";
  const params = [userId, cardNumber, expirationDate];

  let conn;
  try {
    conn = await pool.getConnection(); // Use the MariaDB connection pool
    console.log('Inserting card with params:', params); // Log parameters
    const result = await conn.query(sql, params);
    return result; // Return the result of the query
  } catch (error) {
    console.error('Error saving card:', error); // Log the entire error object
    throw new Error('Could not add card');
  } finally {
    if (conn) conn.release(); // Release the connection back to the pool
  }
}

// Export the Card class and the addCardToDatabase function
module.exports = { Card, addCardToDatabase }; 