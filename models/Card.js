const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  cardId: {
    type: String,
    required: true,
    unique: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usage',
    default: null
  }
});

module.exports = mongoose.model('Card', cardSchema); 