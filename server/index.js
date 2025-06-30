const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const User = require('./Models/User');
const RegularEvent = require('./Models/RegularEvent');
const EventApplication = require('./Models/EventApplication'); 
const RSVP = require("./Models/RSVP");
const Attendance = require("./Models/Attendance");
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authRoutes = require('./auth');

require('./db/connection');

//middleware
const app = express();
app.use(express.json()); //middleware to parse JSON requests
app.use(express.urlencoded({ extended: true }));
app.use('/api', authRoutes); //mount auth routes

//CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

//ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

//multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); //save to ./uploads/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadsDir));

/* PURPOSE: Fetches Registered User from Database */
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -__v -resetToken') //exclude sensitive fields
      .sort({ createdAt: -1 }); //newest first
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* PURPOSE: Serving Static Files from Files Directory */
app.use('/files', express.static(path.join(__dirname, 'files')));

/* PURPOSE: Fetches Existing User Profile in the Database */
app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -googleId -__v'); //exclude sensitive fields
    
    if (!user) return res.status(404).send('User not found');
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      utdEmail: user.utdEmail,
      pronouns: user.pronouns,
      major: user.major,
      year: user.year,
      points: user.points || 0,
      attendedEvents: user.attendedEvents,
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

/* PURPOSE: Updates Existing User Profile in the Database */
app.patch('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body; //fields to update (pronouns, major, etc)

    console.log(`updating user ${userId} with:`, updates);

    //validate updates - prevent updating protected fields like googleId
    const allowedUpdates = ['pronouns', 'major', 'year', 'utdEmail'];
    const isValidUpdate = Object.keys(updates).every(key => allowedUpdates.includes(key));

    if (!isValidUpdate) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    //find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true } //return updated user + validate data
    ).select('-googleId -__v'); //exclude sensitive/uneeded fields

    if (!updatedUser) {
      console.error(`User ${userId} not found`);
      return res.status(404).send('User not found');
    }

    console.log(`Successfully updated user ${userId}`);
    res.json(updatedUser);

  } catch (error) {
    console.error(`Update failed for ${req.params.id}:`, error);
    res.status(500).send({ error: 'Server error during update' });
  }
});

 /* PURPOSE: Checks if Gmail Exists Already in Database */
app.get('/user/gmail/:gmail', async (req, res) => {
  try {
    const gmailId = req.params.gmail;
    console.log(`fetching user with email: ${gmailId}`); //debugging

    const user = await User.findOne({ gmail: gmailId }).lean();
    
    if (!user) {
      console.error(`user not found: ${gmailId}`);
      return res.status(404).send('user not found');
    } //returns gmail ID without password

    //response object
    const userProfile = {
      name: user.name,
      email: user.email || user.gmail,
      pronouns: user.pronouns,
      major: user.major,
      year: user.year
    };

    console.log(`returning profile for: ${gmailId}`);
    res.json(userProfile);

  } catch (error) {
    console.error(`server error fetching: ${req.params.gmail}:`, error);
    res.status(500).json({ message: 'server error', error: error.message });
 }
});


/*  <------------  EVENTS TABLE  ------------>  */

/* PURPOSE: Retrieve All Existing Events from Database */
app.get('/regularevents', async (req, res) => {
  try {
    const events = await RegularEvent.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* PURPOSE: Admin Event Creation */
app.post('/regularevents', upload.single('poster'), async (req, res) => {
  try {
    console.log("Received request:", {
      body: req.body,
      file: req.file ? `File received: ${req.file.originalname}` : 'No file received'
    });

    // Parse form data
    const {
      title,
      description,
      date,
      location,
      appReq = 'false', // Default as string since FormData sends strings
      points = '0'      // Default as string
    } = req.body;

    // Handle file upload
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate required fields
    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert values to proper types
    const parsedAppReq = appReq === 'true';
    const parsedPoints = parseInt(points);
    
    // Validate points is a valid number
    if (isNaN(parsedPoints)) {
      return res.status(400).json({ message: 'Points must be a valid number' });
    }

    // Create new event (without any rsvp fields)
    const newEvent = new RegularEvent({
      title,
      description,
      date: new Date(date),
      location,
      appReq: parsedAppReq,
      points: parsedPoints,
      actualAttendees: [], // Explicit empty array
      imageUrl
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
    
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      message: 'Error saving event',
      error: error.message
    });
  }
});

/* PURPOSE: Retrieves RSVP Data */
app.get('/rsvps', async (req, res) => {
  try {
    const eventsWithRsvps = await RegularEvent.aggregate([
      {
        $lookup: {
          from: "rsvps",
          let: { eventId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$eventId", "$$eventId"] },
                status: "Going"
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            { $unwind: "$user" },
            {
              $project: {
                _id: 1, // Keep the RSVP ID
                userId: 1,
                userName: "$user.name",
                utdEmail: "$user.utdEmail",
                status: 1,
                createdAt: 1
              }
            }
          ],
          as: "rsvps"
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          date: 1,
          location: 1,
          description: 1,
          rsvps: 1,
          rsvpCount: { $size: "$rsvps" }
        }
      }
      //removed the $match filter to include all events, not just those with RSVPs
    ]);

    res.json(eventsWithRsvps);
  } catch (err) {
    console.error('Error fetching RSVPs:', err);
    res.status(500).json({ error: "Failed to fetch RSVP data" });
  }
});

/* PURPOSE: Updates Database with who RSVP'd */
app.post('/regularevents/:eventId/rsvp', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, userName, isChecked } = req.body;

    // Validate event and user
    const [event, user] = await Promise.all([
      RegularEvent.findById(eventId),
      User.findById(userId)
    ]);
    if (!event) throw new Error("Event not found");
    if (!user?.utdEmail) throw new Error("User must have a UTD email to RSVP");

    // Update RSVP
    let rsvp;
    if (isChecked) {
      rsvp = await RSVP.findOneAndUpdate(
        { eventId, userId },
        { $set: { status: "Going", userName, utdEmail: user.utdEmail } },
        { upsert: true, new: true }
      );
    } else {
      await RSVP.deleteOne({ eventId, userId });
    }

    res.status(200).json({ 
      message: `RSVP ${isChecked ? "added" : "removed"}`,
      status: isChecked ? "Going" : "Not Going",
      rsvp: isChecked ? rsvp : null // Optional
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* PURPOSE: Saves Speed Mentoring Applications to Database*/
app.post('/eventapplications/', async (req, res) => {
  const {
    userId,
    eventId,
    name,
    pronouns,
    email,
    year,
    grad,
    history,
    reason
  } = req.body;

  console.log('Incoming application data:', req.body);

  //validation
  if (!name || !pronouns || !email || !year || !grad || !history || !reason) {
      return res.status(400).json({ message: 'All fields except userId and eventId are required' });
  }

  try {
      const newApplication = new EventApplication({
          userId: userId || null,  //handle cases where userId might be undefined
          eventId: eventId || null,
          name,
          pronouns,
          email,
          year,
          grad,
          history,
          reason
      });

      const savedApplication = await newApplication.save();
      res.status(201).json({ 
          message: 'Application submitted successfully',
          application: savedApplication
      });
  } catch (error) {
      console.error('Database save error:', error);
      res.status(500).json({ 
          message: 'Error submitting application',
          error: error.message 
      });
  }
});

/* PURPOSE: Fetches Event Applications */
app.get('/eventapplications/with-events', async (req, res) => {
  try {
      const applications = await EventApplication.aggregate([
          {
              $lookup: {
                  from: "regularevents", // Your events collection name
                  localField: "eventId",
                  foreignField: "_id",
                  as: "event"
              }
          },
          { $unwind: "$event" },
          {
              $group: {
                  _id: "$eventId",
                  eventName: { $first: "$event.title" },
                  eventDate: { $first: "$event.date" },
                  applicationCount: { $sum: 1 },
                  applications: { $push: "$$ROOT" }
              }
          },
          { $sort: { eventDate: 1 } }
      ]);
      
      res.json(applications);
  } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: 'Error fetching applications' });
  }
});

// PURPOSE: Records a User's Attendance + Updates their Profile
app.post('/api/events/:eventId/check-in', async (req, res) => {
  try {
    console.log('Received check-in request:', req.params, req.body);

    const { eventId } = req.params;
    const { userId } = req.body; //or get userId from auth middleware (recommended)

    //validate event and user
    console.log('Looking for event:', eventId);
    const [event, user] = await Promise.all([
      RegularEvent.findById(eventId),
      User.findById(userId)
    ]);
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    //prevent duplicate check-ins
    console.log('Looking for user:', userId);
    const existingAttendance = await Attendance.findOne({ eventId, userId });
    if (existingAttendance) {
      return res.status(400).json({ error: "User already checked in" });
    }

    //create attendance record
    const attendance = new Attendance({
      eventId,
      userId,
      userName: user.name,
      utdEmail: user.utdEmail,
      eventTitle: event.title,
      pointsAwarded: event.points
    });
    await attendance.save();

    //update user's profile (denormalize)
    await User.findByIdAndUpdate(userId, {
      $inc: { points: event.points },
      $push: {
        attendedEvents: {
          eventId,
          title: event.title,
          date: event.date,
          pointsEarned: event.points,
          checkInTime: new Date()
        }
      }
    });

    res.status(201).json({ success: true, attendance });
  } catch (err) {
    console.error('Full error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// PURPOSE: Fetches All Attendees for a Specific Event
app.get('/api/events/:eventId/attendees', async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendees = await Attendance.find({ eventId })
      .sort({ checkInTime: -1 }) //newest first
      .select('userId userName utdEmail checkInTime pointsAwarded');

    res.status(200).json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PURPOSE: Fetches a User's Attendance History
app.get('/api/events/users/:userId/attendance', async (req, res) => {
  try {
    const { userId } = req.params;

    const userAttendance = await Attendance.exists({ userId })

    res.status(200).json(userAttendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PURPOSE: Retrieves Attendance
app.get('/api/events/attendance', async (req, res) => {
  try {
    const eventsWithAttendance = await RegularEvent.aggregate([
      {
        $lookup: {
          from: 'attendances',
          let: { eventId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$eventId", "$$eventId"] }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            { $unwind: "$user" },
            {
              $project: {
                _id: 1,
                userId: 1,
                userName: "$user.name",
                utdEmail: "$user.utdEmail",
                checkInTime: 1,
                pointsAwarded: 1
              }
            }
          ],
          as: 'attendees'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          date: 1,
          location: 1,
          description: 1,
          attendees: 1,
          attendanceCount: { $size: "$attendees" }
        }
      },
      { $sort: { date: -1 } }
    ]);
    
    res.json(eventsWithAttendance);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

/*  <------------  EVENTS TABLE  ------------>  */

/* GORL idk why but i have to comment
these out/back in all the time */
app.listen(4000, () => {
  console.log('Server is running on port 4000');
}); 

module.exports = app;