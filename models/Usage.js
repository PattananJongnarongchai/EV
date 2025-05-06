const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Usage', usageSchema); 