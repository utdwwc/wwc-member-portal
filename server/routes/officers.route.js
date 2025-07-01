const express = require('express');
const multer = require('multer');
const app = express.Router();
const Officer = require('../Models/Officers');

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
});

// POST create officer with file upload
app.post('/', upload.single('image'), async (req, res) => {
  try {
    // Construct the image URL based on where you'll serve the files from
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const officer = new Officer({
      name: req.body.name,
      position: req.body.position,
      imageUrl: imageUrl,
      github: req.body.github,
      linkedin: req.body.linkedin,
      email: req.body.email
    });

    const newOfficer = await officer.save();
    res.status(201).json(newOfficer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all officers
app.get('/', async (req, res) => {
  try {
    const officers = await Officer.find();
    res.json(officers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single officer
app.get('/:id', getOfficer, (req, res) => {
  res.json(res.officer);
});

// PATCH update officer
app.patch('/:id', getOfficer, async (req, res) => {
  if (req.body.name != null) res.officer.name = req.body.name;
  if (req.body.position != null) res.officer.position = req.body.position;
  if (req.body.imageUrl != null) res.officer.imageUrl = req.body.imageUrl;
  if (req.body.github != null) res.officer.github = req.body.github;
  if (req.body.linkedin != null) res.officer.linkedin = req.body.linkedin;
  if (req.body.email != null) res.officer.email = req.body.email;

  try {
    const updatedOfficer = await res.officer.save();
    res.json(updatedOfficer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE officer
app.delete('/:id', getOfficer, async (req, res) => {
  try {
    await res.officer.deleteOne();
    res.json({ message: 'Officer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get officer by ID
async function getOfficer(req, res, next) {
  let officer;
  try {
    officer = await Officer.findById(req.params.id);
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.officer = officer;
  next();
}

module.exports = app;