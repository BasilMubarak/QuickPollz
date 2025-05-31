const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [
    {
      text: String,
      votes: { type: Number, default: 0 }
    }
  ]
});

module.exports = mongoose.model('Poll', pollSchema);
