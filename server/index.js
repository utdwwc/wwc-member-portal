const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const User = require('./Models/User');  // Adjust the path as needed
const RegularEvent = require('./Models/RegularEvent'); // Add this line
const Application = require('./Models/EventApplication'); 
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const jwt = require('jsonwebtoken'); // TESTING RQQQ: i dont like u jwt
const bcrypt = require('bcryptjs'); // TESTING RQQQ: being difficult boohoo

require('./db/connection');

const app = express();
app.use(express.json());
app.use(require('cors')());

app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  credentials: true
}));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


//post sends information to the dataabse and get retrieves information from the database
app.post('/', upload.single('resume'), async (req, res) => {
  try {
    // Destructure with default values
    const { 
      name = '', 
      email = '', 
      gmail = '', 
      password = '', 
      pronouns = '', 
      major = '', 
      year = '', 
      JPMorgan = 'false' // Default to string 'false'
    } = req.body;

    // Validate required fields
    if (!name || !email || !gmail) {
      return res.status(400).json({ 
        error: 'Missing required fields (name, email, or gmail)' 
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      gmail,
      password,
      pronouns,
      major,
      year,
      JPMorgan: JPMorgan === 'true', // Convert to boolean
      isAdmin: email === 'utdwwc@gmail.com'
    };

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    // Only add resume if file exists
    if (req.file) {
      userData.resume = {
        path: req.file.path,
        contentType: req.file.mimetype
      };
    }
    
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Detailed save error:', {
      message: error.message,
      validationErrors: error.errors,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ 
        error: 'Email or gmail already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// TESTINGGGG RQQQQ: Register route
app.post('/register', async (req, res) => {
  try {
    console.log('Received registration data:', req.body);
    
    // Manually extract file if using multipart/form-data
    const { name, email, password, pronouns, major, year, JPMorgan } = req.body;
    
    // Create user
    const user = new User({
      name,
      email,
      password,
      pronouns,
      major,
      year,
      JPMorgan: JPMorgan === 'true',
      isAdmin: email === 'utdwwc@gmail.com'
    });

    // Handle file if uploaded
    if (req.file) {
      user.resume = {
        path: req.file.path,
        contentType: req.file.mimetype
      };
    }

    await user.save();
    console.log('User created successfully:', user);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// TESTINGGGG RQQQQ: Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.generateAuthToken();

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Serve static files from the 'files' directory
app.use('/files', express.static(path.join(__dirname, 'files')));

app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Fetching user with ID: ${userId}`); // Log the ID for debugging
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).send('User not found');
    }
    // Return user information without the password
    const { name, email, pronouns, major, year, JPMorgan, resume } = user;
    res.json({ name, email, pronouns, major, year, JPMorgan, resume });
  } catch (error) {
    console.error(`Error fetching user details for user ID: ${req.params.id}`, error);
    res.status(500).send('Server error');
  }
});

 app.get('/user/gmail/:gmail', async (req, res) => {
   try {
    console.log(`Fetching user with email: `); // Log the ID for debugging
     const gmailId = req.params.gmail;
     console.log(`Fetching user with email: ${gmailId}`); // Log the ID for debugging
    const user = await User.findOne({ gmail: gmailId });
        if (!user) {
       console.error(`User with ID ${gmailId} not found`);
       return res.status(404).send('User not found');
     }
     // Return user information without the password
          const { name, email, gmail, pronouns, major, year, } = user;
     res.json({ name, email, gmail, pronouns, major, year});
   } catch (error) {
     console.error(`Error fetching user details for user ID: ${req.params.gmail}`, error);
     res.status(500).send('Server error');
  }
 });


app.get('/user/:id/resume', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.resume) {
      const filePath = path.join(__dirname, user.resume.path); // Build the file path

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath); // Send the file to the client
      } else {
        console.error(`File not found: ${filePath}`);
        res.status(404).send('File not found');
      }
    } else {
      console.error(`User or resume not found for user ID: ${req.params.id}`);
      res.status(404).send('User or resume not found');
    }
  } catch (error) {
    console.error(`Server error while fetching resume for user ID: ${req.params.id}`, error);
    res.status(500).send('Server error');
  }
});

app.get('/user/:id/resume', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.resume) {
      const filePath = path.join(__dirname, user.resume.path); // Build the file path

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath); // Send the file to the client
      } else {
        res.status(404).send('File not found');
      }
    } else {
      res.status(404).send('User or resume not found');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

//events table 
// RSVP endpoint
app.post('/regularevents/:eventId/rsvp', async (req, res) => {
  const eventId = req.params.eventId;
  const { userId, isChecked } = req.body; // Now receiving isChecked from frontend

  try {
      // Find the event by ID
      const event = await Event.findById(eventId);

      if (!event) {
          return res.status(404).json({ message: 'Event not found' });
      }

      if (isChecked) {
          // Add user to the attendees list if they checked the box
          if (!event.attendees.includes(userId)) {
              event.attendees.push(userId);
          } else {
              return res.status(400).json({ message: 'User has already RSVPed' });
          }
      } else {
          // Remove user from the attendees list if they unchecked the box
          event.attendees = event.attendees.filter(id => id.toString() !== userId);
      }

      await event.save(); // Save the updated event

      res.status(200).json({ message: 'RSVP updated successfully', event });
  } catch (error) {
      console.error('Error RSVPing for event:', error);
      res.status(500).json({ error: 'Error RSVPing for event' });
  }
});

//specialEvents (applications table)
app.post('/eventapplications/', async (req, res) => {
  const { userId, eventId, name, email, year, reason } = req.body;

  console.log('Incoming request data:', req.body);

  // Validate incoming data
  if (!userId || !eventId || !name || !email || !year || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
  }

  try {
      const newApplication = new Application({
          userId,
          eventId,
          name,
          email,
          year,
          reason,
      });

      const savedApplication = await newApplication.save();
      res.status(201).json({ message: 'Application submitted successfully', application: savedApplication });
  } catch (error) {
      console.error('Error saving application:', error);
      res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

//points 
app.post('/users', async (req, res) => {
  const { email, eventID } = req.body; 
  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    user.points += 1;
    await user.save();

    let event = await RegularEvent.findOne({ eventID });
    const userID = user._id;

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!event.attendees.includes(userID.toString())) {
      event.attendees.push(userID.toString());
      await event.save();
    }

    res.json({ message: `Check-in successful! Your points are now ${user.points}.`, userID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during check-in.' });
  }
});

/* TESTINGGGG RQQQQQQQ: isAdmin middleware
const isAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check admin status
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
}; */
const isAdmin = async (req, res, next) => {
  const userId = req.body.userId; // Assume userId is sent in the request body
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.email !== 'utdwwc@gmail.com') {
    return res.status(403).json({ message: 'No admin privileges granted' });
  }

  if (user && user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};


/* TESTINGGGG RQQQQQ: token and auth middleware
app.get('/admin/test', isAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
}); */

// TESTINGGGGGG RQQQQQQQQ: Create event (admin only)
/*
app.post('/admin/events', isAdmin, async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newEvent = new Event({ 
      title, 
      description, 
      date: new Date(date), 
      location 
    });

    const savedEvent = await newEvent.save();
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
}); */


// display events on admin page (without token) - TEMPORARY 
// changed /events to /regularevents
app.get('/regularevents', async (req, res) => {
  try {
    console.log('Fetching events from DB...'); //Debug
    const events = await RegularEvent.find({})
      .sort({ date: 1 }); //Sort by date ascending
    console.log('Found events');
    res.json(events);
  } catch (error) {
    console.log('DB Error:', error)
    res.status(500).json({ error: error.message });
  }
});
/*
app.post('/admin/events', async (req, res) => {
  const { title, description, date, location } = req.body;
  const newEvent = new Event({ title, description, date, location });
  await newEvent.save();
  res.status(201).json(newEvent);
}); */


// display users on admins page
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -__v -resetToken') // Exclude sensitive fields
      .sort({ createdAt: -1 }); // Newest first
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/* TESTING RQQQ: taking out for now
app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});
*/

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});