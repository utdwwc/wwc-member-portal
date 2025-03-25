const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    isSpecial: {type: Boolean, required: true, default: false}, 
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Store user IDs of attendees
    attendeesNames: [{ name: { type: String }, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }], // Store both names and user IDs
    actualAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Store user IDs of attendees
}); 

const RegularEvent = mongoose.model('RegularEvent', eventSchema);

const insertEvent = async () => {
    // New regular event
    const newRegularEvent = new RegularEvent({
        title: 'Coding WKSHP',
        description: 'Join us for an exciting coding workshop where you will learn the basics of web development and build your first website!',
        date: new Date('2024-10-15'),
        location: 'Room 101, Main Building',
        isSpecial: false,
        attendees: [],  // Initially empty
        actualAttendees: []
    });

    // New special event
    const newSpecialEvent = new RegularEvent({ // Assuming SpecialEvent extends RegularEvent
        title: 'Speed Mentoring!!!',
        description: 'Get valuable insights and advice from industry professionals in a fast-paced mentoring session!',
        date: new Date('2024-10-22'), // Adjust the date as needed
        location: 'Room 202, Main Building',
        isSpecial: true,
        attendees: [], // Initially empty
        actualAttendees: [], 
    });

    try {
        const savedRegularEvent = await newRegularEvent.save(); // Save the regular event to MongoDB
        console.log('Regular Event saved:', savedRegularEvent);

        const savedSpecialEvent = await newSpecialEvent.save(); // Save the special event to MongoDB
        console.log('Special Event saved:', savedSpecialEvent);
    } catch (error) {
        console.error('Error saving event:', error);
    }
};

insertEvent();

module.exports = RegularEvent;
