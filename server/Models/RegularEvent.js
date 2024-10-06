const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Store user IDs of attendees
});
const RegularEvent = mongoose.model('RegularEvent', eventSchema);

const insertEvent = async () => {
    const newEvent = new RegularEvent({
        title: 'Coding Workshop',
        description: 'Join us for an exciting coding workshop where you will learn the basics of web development and build your first website!',
        date: new Date('2024-10-15'),
        location: 'Room 101, Main Building',
        attendees: [] // Initially empty
    });

    try {
        const savedEvent = await newEvent.save(); // Save the event to MongoDB
        console.log('Event saved:', savedEvent);
    } catch (error) {
        console.error('Error saving event:', error);
    }
};

insertEvent();

module.exports = RegularEvent;
