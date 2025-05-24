const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },  //cached for quick lookups
  utdEmail: { type: String },                 //optional but useful for reports
  eventTitle: { type: String, required: true }, //avoids frequent joins
  pointsAwarded: { type: Number, required: true }, //points from the event
  checkInTime: { type: Date, default: Date.now },  //when attendance was recorded
  verified: { type: Boolean, default: false }, //for staff verification
  notes: String                               //optional officer notes
}, { timestamps: true });

//compound index for faster queries
attendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true }); //prevent duplicates
attendanceSchema.index({ userId: 1, checkInTime: -1 }); //optimize user profile queries

//export properly
const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;