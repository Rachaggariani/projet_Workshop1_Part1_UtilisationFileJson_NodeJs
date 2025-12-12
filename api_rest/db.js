// db.js
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'bdmonapi';
let db = null;

const connectDB = async () => {
    try {
        const client = new MongoClient(url); // plus besoin de useUnifiedTopology
        await client.connect(); // connexion asynchrone
        console.log("Connexion réussie avec MongoDB");
        db = client.db(dbName);
        return db;
    } catch (err) {
        console.error("Erreur de connexion à MongoDB", err);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) throw new Error("La DB n'est pas encore connectée");
    return db;
};

module.exports = { connectDB, getDB };
