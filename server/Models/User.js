const mongoose = require('mongoose');

// TESTING RQQQQQ: setting up token generation and verification
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pronouns: String,
    major: String,
    year: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    gmail: {
        type: String, 
        required: true, 
        unique: true
    },
    password: {
        type: String,
        required: true // Add if passwords are mandatory
    },
    JPMorgan: { // Note: Consistent capitalization
        type: Boolean,
        default: false, // Change default to false
    },
    points: {
        type: Number,
        default: 0, 
    }, 
    resume: {
        path: String,
        contentType: String
    }, 
    isAdmin: {
        type: Boolean,
        default: false, 
    }
}, { timestamps: true }); // Add timestamps for debugging

// TESTING RQQQQ: Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  });

// TESTINGGG RQQQQQ: Generate JWT token
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
      {
        userId: this._id,
        email: this.email,
        isAdmin: this.isAdmin
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    console.log('Token generated for user:', this.email, token); // Debug log
    return token;
  };

// Make sure you export the model properly
const User = mongoose.model('User', userSchema);
module.exports = User;