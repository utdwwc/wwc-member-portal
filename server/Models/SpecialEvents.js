const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: false,
        default: null
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegularEvent', // Reference to the SpecialEvent model
        required: false,
        default: null
    },
    name: {
        type:String, 
        required: true
    }, 
    email:{
        type: String,
        required: true
    }, 
    year: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    }
});
const SpecialEvents = mongoose.model('eventapplications', applicationSchema);
const insertEvent = async () => {

    // New special event
    const newSpecialApplicationEvent = new SpecialEvents({ // Assuming SpecialEvent extends RegularEvent
        userId: '6701d63c84d1943a2dac42dd', 
        eventId : '6701cc315e02bdc39d7666ae', 
        name: "aaryaa", 
        email: "aaryaamoharir@gmail.com", 
        year: "Freshman", 
        reason: "I want to learn programming", 
    });

    try {
        const savedSpecialEvent = await newSpecialApplicationEvent.save(); // Save the special event to MongoDB
        console.log('Special Application Event saved:', savedSpecialEvent);
    } catch (error) {
        console.error('Error saving event:', error);
    }
};

insertEvent(); 

module.exports = SpecialEvents;
