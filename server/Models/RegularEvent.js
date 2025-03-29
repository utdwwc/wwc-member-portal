const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    isSpecial: {type: Boolean, required: true, default: false}, 
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Store user IDs of attendees
    attendeesNames: [{ name: { type: String }, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }], // Store both names and user IDs
    actualAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Store user IDs of attendees
    points: {type: Number, default: 0, min: 0}
}); 

const RegularEvent = mongoose.model('RegularEvent', eventSchema);

module.exports = RegularEvent;
