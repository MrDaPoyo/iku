const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { promisify } = require('util');

var db = new sqlite3.Database('iku.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, fav_genre TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY, title TEXT, artist TEXT, album TEXT, year INTEGER, genre TEXT, user_id INTEGER)');
    db.run('CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, content TEXT, post_id INTEGER, user_id INTEGER)');
    db.run('CREATE TABLE IF NOT EXISTS playlists (id INTEGER PRIMARY KEY, name TEXT, user_id INTEGER)');
    db.run('CREATE TABLE IF NOT EXISTS playlist_tracks (playlist_id INTEGER, track_id INTEGER, PRIMARY KEY (playlist_id, track_id), FOREIGN KEY (playlist_id) REFERENCES playlists(id), FOREIGN KEY (track_id) REFERENCES tracks(id))');
});

function registerUser(name, password) {
    if (!name || !password) {
        return 'Please fill in all the fields';
    }
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    db.run('INSERT INTO users (name, password) VALUES (?, ?)', [name, hash], (err) => {
        if (err) {
            console.error(err.message);
            return err.message;
        } else {
            console.log('User registered successfully');
            return 'User registered successfully';
        }
    });
}

const dbGet = promisify(db.get.bind(db));

async function loginUser(username, password) {
    if (!username || !password) {
        return 'Please fill in all the fields';
    }
    try {
        const row = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
        if (row) {
            const result = await comparePasswords(password, row.password);
            if (result) {
                return row.id; // Return the user ID upon successful login
            } else {
                return 'Invalid Credentials';
            }
        } else {
            return 'Invalid Credentials';
        }
    } catch (err) {
        return err.message;
    }
}

async function checkUserById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(false);
            } else {
                resolve(row);
            }
        });
    });
}

function comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = {
    db,
    registerUser,
    loginUser,
    comparePasswords,
    checkUserById,
};