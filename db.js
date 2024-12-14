const sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('iku.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY, title TEXT, artist TEXT, album TEXT, year INTEGER, genre TEXT, user_id INTEGER)');
    db.run('CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, content TEXT, post_id INTEGER, user_id INTEGER)');
});

module.exports = db;