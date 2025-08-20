const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    pronouns: String,
    major: String,
    year: String,
    email: {  type: String, unique: true, sparse: true },//not required
    utdEmail: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true }, //stores googleId for OAuth users
    points: { type: Number, default: 0 }, 
    attendedEvents: [{
      eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
      title: String,                   //denormalized for quick display
      date: Date,                      //event date
      pointsEarned: Number,            //points from this event
      checkInTime: { type: Date, default: Date.now } //when attended
    }]
}, { timestamps: true }); //add timestamps for debugging

//only hash password if it's modified (and exists)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next(); // Skip if no password (Google OAuth users)

  try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
  } catch (err) {
      next(err);
  }
});

//generate JWT token
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
    console.log('Token generated for user:', this.email, token); //debug log
    return token;
  };

// Make sure you export the model properly
const User = mongoose.model('User', userSchema);
module.exports = User;