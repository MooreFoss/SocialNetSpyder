const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URI, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    console.log('Connected to the database');

    const collections = await mongoose.connection.db.listCollections().toArray();

    for (let collection of collections) {
        await mongoose.connection.db.collection(collection.name).deleteMany({});
        console.log(`Cleared collection: ${collection.name}`);
    }

    console.log('Database cleared');
});