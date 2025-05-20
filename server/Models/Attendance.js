const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  //required references
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  //denormalized data (for performance)
  userName: { type: String, required: true },  //cached for quick lookups
  utdEmail: { type: String },                 //optional but useful for reports
  eventTitle: { type: String, required: true }, //avoids frequent joins

  //check-in details
  pointsAwarded: { type: Number, required: true }, //points from the event
  checkInTime: { type: Date, default: Date.now },  //when attendance was recorded

  //metadata
  verified: { type: Boolean, default: false }, //for staff verification
  notes: String                               //optional staff notes
}, { timestamps: true });

//compound index for faster queries
attendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true }); //prevent duplicates
attendanceSchema.index({ userId: 1, checkInTime: -1 }); //optimize user profile queries

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;