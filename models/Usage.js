// models/Usage.js

// Remove mongoose import
// const mongoose = require('mongoose');

// Define the Usage structure
class Usage {
  constructor(cardNumber, memberName, startDate, startTime, hourlyRate) {
    this.cardNumber = cardNumber; // This should be the ID of the card
    this.memberName = memberName;
    this.startDate = startDate;
    this.startTime = startTime;
    this.endTime = null; // Default value
    this.hourlyRate = hourlyRate;
    this.totalCost = 0; // Default value
  }
}

// Function to add usage to the database
const addUsageToDatabase = async (usageData) => {
  const sql = "INSERT INTO Usage (card_number, member_name, start_date, start_time, hourly_rate) VALUES (?, ?, ?, ?, ?)";
  const params = [usageData.cardNumber, usageData.memberName, usageData.startDate, usageData.startTime, usageData.hourlyRate];

  let conn;
  try {
    conn = await pool.getConnection(); // Use the MariaDB connection pool
    const result = await conn.query(sql, params);
    return result; // Return the result of the query
  } catch (error) {
    console.error('Error saving usage:', error);
    throw new Error('Could not add usage');
  } finally {
    if (conn) conn.release(); // Release the connection back to the pool
  }
}

// Export the Usage class and the addUsageToDatabase function
module.exports = { Usage, addUsageToDatabase }; 