// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Body parser middleware
const MONGODB_URI = process.env.MONGODB_URI;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // dbName: 'clarkebotDB' // Specify the database name
    dbName: "testDB" // DB for testing
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');



//     // MongoDB Schema and Model
// const threadSchema = new mongoose.Schema({
//     userMessage: String,
//     threadId: String,
//     messages: [{ role: String, content: String }],
// });

// // Specify the collection name explicitly
// const Thread = mongoose.model('Thread', threadSchema);

//     // Create and save the test document once the database connection is open
//     const test = new Thread({
//         userMessage: "Hello",
//         threadId: "testId",
//         messages: [{ role: "user", content: "Hello there!"}],
//     });

//     test.save()
//         .then(() => console.log('Test thread created'))
//         .catch(error => console.error('Error creating test thread:', error));




});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
