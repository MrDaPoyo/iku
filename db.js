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
    db.run('CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY, title TEXT, artist TEXT, album TEXT, year INTEGER, genre TEXT, length INTEGER, user_id INTEGER, path TEXT UNIQUE NOT NULL, cover TEXT, FOREIGN KEY (user_id) REFERENCES users(id))');
    db.run('CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, content TEXT, post_id INTEGER, user_id INTEGER, FOREIGN KEY (post_id) REFERENCES posts(id), FOREIGN KEY (user_id) REFERENCES users(id))');
    db.run('CREATE TABLE IF NOT EXISTS playlists (id INTEGER PRIMARY KEY, name TEXT, user_id INTEGER, cover TEXT, FOREIGN KEY (user_id) REFERENCES users(id))');
    db.run('CREATE TABLE IF NOT EXISTS playlist_tracks (playlist_id INTEGER, track_id INTEGER, PRIMARY KEY (playlist_id, track_id), FOREIGN KEY (playlist_id) REFERENCES playlists(id), FOREIGN KEY (track_id) REFERENCES tracks(id))');
    db.get('SELECT COUNT(*) AS count FROM tracks', (err, row) => {
        if (err) {
            console.error(err.message);
        } else if (row.count === 0) {
            db.run('INSERT INTO tracks (title, artist, album, year, genre, user_id, path, length) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                ['Sample Track No1', 'Sample Artist No1', 'Sample Album No1', 2024, 'Sample Genre', 1, "elevator-music-bossa-nova.mp3", 180], 
                (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('Sample track inserted successfully');
                    }
                }
            );
        }
    });
    db.get('SELECT COUNT(*) AS count FROM playlists', (err, row) => {
        if (err) {
            console.error(err.message);
        } else if (row.count === 0) {
            db.run('INSERT INTO playlists (name, user_id, cover) VALUES (?, ?, ?)', ['Sample Playlist', 1, null], function(err) {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log('Sample playlist created successfully');
                    db.run('INSERT INTO playlist_tracks (playlist_id, track_id) VALUES (?, ?)', [this.lastID, 1], (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('Sample track added to sample playlist successfully');
                        }
                    });
                }
            });
        }
    });
});


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

function checkUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(false);
            } else {
                resolve(row);
            }
        });
    });
}

async function registerUser(name, password, favGenre) {
    if (!name || !password || !favGenre) {
        return Promise.resolve('Please fill in all the fields');
    }
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password, fav_genre) VALUES (?, ?, ?)', [name, hash, favGenre], async (err) => {
            if (err) {
                console.error(err.message);
                reject(err.message);
            } else {
                console.log('User registered successfully');
                try {
                    const user = await checkUserByUsername(name);
                    resolve(user);
                } catch (error) {
                    reject(error.message);
                }
            }
        });
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

function comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
}

function registerTrack(title, artist, album, year, genre, user_id, path, length, cover) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO tracks (title, artist, album, year, genre, user_id, path, length, cover) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [title, artist, album, year, genre, user_id, path, length, cover], (err) => {
            if (err) {
                console.warn(err.message);
                reject(err.message);
            } else {
                console.log('Track registered successfully');
                resolve(true);
            }
        });
    });
}

function getTrackStatsByName(name) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tracks WHERE title = ?', [name], (err, row) => {
            if (err) {
                reject(false);
            } else {
                resolve(row);
            }
        });
    });
}

function getTrackStatsByPath(path) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tracks WHERE path = ?', [path], (err, row) => {
            if (err) {
                reject(false);
            } else {
                resolve(row);
            }
        });
    });
}

function getTrackStatsById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tracks WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(false);
            } else {
                resolve(row);
            }
        });
    });
}

function getTracksByUser(user_id) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM tracks WHERE user_id = ?', [user_id], (err, rows) => {
            if (err) {
                reject(false);
            } else {
                resolve(rows);
            }
        });
    });
}

function getPlaylistsByUser(user_id) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM playlists WHERE user_id = ?', [user_id], (err, rows) => {
            if (err) {
                reject(false);
            } else {
                resolve(rows);
            }
        });
    });
}

function createPlaylist(name, user_id, cover) {
    if (!name || !user_id) {
        return Promise.resolve('Please fill in all the fields');
    }
    cover = cover || null;
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO playlists (name, user_id, cover) VALUES (?, ?, ?)', [name, user_id, cover], (err) => {
            if (err) {
                console.warn(err.message);
                reject(err.message);
            } else {
                console.log('Playlist created successfully');
                resolve(true);
            }
        });
    });
}

function addTrackToPlaylist(playlist_id, track_id) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO playlist_tracks (playlist_id, track_id) VALUES (?, ?)', [playlist_id, track_id], (err) => {
            if (err) {
                console.warn(err.message);
                reject(err.message);
            } else {
                console.log('Track added to playlist successfully');
                resolve(true);
            }
        });
    });
}

function getPlaylistById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM playlists WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(false);
            } else {
                db.all('SELECT * FROM playlist_tracks WHERE playlist_id = ?', [id], (err, rows) => {
                    if (err) {
                        reject(false);
                    } else {
                        if (row) {
                            row.tracks = rows.map(row => row.track_id);
                            resolve(row);
                        } else {
                            resolve(null);
                        }
                    }
                });
            }
        });
    });
}

module.exports = {
    db,
    registerUser,
    loginUser,
    comparePasswords,
    checkUserById,
    checkUserByUsername,
    getTrackStatsByName,
    getTrackStatsByPath,
    getTracksByUser,
    getTrackStatsById,
    registerTrack,
    getPlaylistsByUser,
    createPlaylist,
    addTrackToPlaylist,
    getPlaylistById
};