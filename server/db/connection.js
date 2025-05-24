const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://utdwwc:utdwwc@cluster0.pcvsa.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});