const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

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

function registerUser(name, email, password) {
    if (!name || !email || !password) {
        return 'Please fill in all the fields';
    }
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], (err) => {
        if (err) {
            console.error(err.message);
            return err.message;
        } else {
            console.log('User registered successfully');
            return 'User registered successfully';
        }
    });
}

function comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = {
    db,
    registerUser,
    comparePasswords
};