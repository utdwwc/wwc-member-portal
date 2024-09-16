const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pronouns: {
        type: String
    },
    major: {
        type: String
    },
    year: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
        
    },
    resume: {
        //data: Buffer,     // Store file as binary data
        path:String,
        contentType: String,  // Store file type (e.g., 'application/pdf')
      
    }
});

// Make sure you export the model properly
const User = mongoose.model('User', userSchema);
module.exports = User;
