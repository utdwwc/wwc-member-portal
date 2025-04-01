const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    appReq: {type: Boolean, required: true, default: false},
    points: {type: Number, default: 0, min: 0}, 
    rsvpLimit: { type: Number, default: 0, min: 0 },
    actualAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Store user IDs of attendees
}); 

const RegularEvent = mongoose.model('RegularEvent', eventSchema);

module.exports = RegularEvent;
