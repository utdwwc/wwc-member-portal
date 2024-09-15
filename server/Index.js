const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const User = require('./Models/User');  // Adjust the path as needed
const path = require('path');
const fs = require('fs');

require('./db/connection');

const app = express();
app.use(express.json());
app.use(require('cors')());

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

app.post('/', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, password, pronouns,major,year } = req.body;

    const newUser = new User({
      name,
      email,
      password,
      pronouns,
      major,
      year,
      resume: {
        path: req.file.path,          // Store the file path
        contentType: req.file.mimetype // Store the MIME type
      }
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error saving user or resume' });
  }
});

// Serve static files from the 'files' directory
app.use('/files', express.static(path.join(__dirname, 'files')));

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

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
