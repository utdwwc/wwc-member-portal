const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  imageUrl: { type: String, required: false },
  github: { type: String, required: false },
  linkedin: { type: String, required: false },
  email: { type: String, required: true, lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'] },
  grad: { type: String, required: true }
});

const Officer = mongoose.model('Officer', officerSchema);

module.exports = Officer;
