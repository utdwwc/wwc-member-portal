const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false, default: null },
    name: { type: String, required: true }, 
    pronouns: { type: String, required: true }, 
    email:{ type: String, required: true }, 
    year: { type: String, required: true },
    grad: { type: String, required: true }, 
    history: { type: String, required: true },
    reason: { type: String, required: true }
});

const EventApplication = mongoose.model('eventapplications', applicationSchema);

module.exports = EventApplication;
