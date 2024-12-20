const express = require('express');
const path = require('path');
var db = require('./db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs-extra');
const multer = require('multer');
const getAudioDurationInSeconds = require('get-audio-duration').getAudioDurationInSeconds;

const app = express();
const port = 3000;

const generalMiddleware = (req, res, next) => {
    res.locals.message = req.query.msg;
    next();
};

const loggedInMiddleware = (req, res, next) => {
    if (req.cookies.auth) {
        jwt.verify(req.cookies.auth, process.env.AUTH_SECRET, (err, decoded) => {
            if (err) {
                res.clearCookie('auth');
                res.redirect('/auth/login');
            } else {
                db.checkUserById(decoded.id).then((result) => {
                    if (result) {
                        res.locals.user = result;
                        req.user = result;
                        return next();
                    } else {
                        res.clearCookie('auth');
                        return res.redirect('/auth/login');
                    }
                });
            }
        });
    } else {
        res.redirect('/auth/login');
    }
}

const notLoggedInMiddleware = (req, res, next) => {
    if (!req.cookies.auth) {
        next();
    } else {
        res.redirect('/');
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 10000000 } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(generalMiddleware);

// Define a route
app.get('/', loggedInMiddleware, (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/auth/login', notLoggedInMiddleware, (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/auth/login', notLoggedInMiddleware, async (req, res) => {
    const { username, password } = req.body;
    const result = await db.loginUser(username, password);
    if (typeof result === 'number') {
        const token = jwt.sign({ id: result }, process.env.AUTH_SECRET, { expiresIn: '24h' });
        res.cookie('auth', token, { httpOnly: true });
        res.redirect('/');
    } else {
        res.redirect("/auth/login?msg=" + result);
    }
});

app.get('/auth/register', notLoggedInMiddleware, (req, res) => {
    res.render('register', { title: 'Register' });
});

app.post('/auth/register', notLoggedInMiddleware, async (req, res) => {
    const { username, password, genre } = req.body;
    if (!username || !password || !genre) {
        return res.redirect('/auth/register?msg=Please fill in all the fields');
    }
    if (username.length > 15) {
        return res.redirect("/auth/register?msg=Username can't be longer than 15 characters");
    }
    if (password.length < 8) {
        return res.redirect("/auth/register?msg=Password must be at least 8 characters long");
    }
    if (genre.length > 10) {
        return res.redirect("/auth/register?msg=Genre can't be longer than 10 characters");
    }
    if (await db.checkUserById(username)) {
        return res.redirect("/auth/register?msg=Username already taken");
    }
    try {
        const result = await db.registerUser(username, password, genre);
        if (result) {
            res.redirect('/auth/login?msg=Registered successfully, please login to access your account!');
        } else {
            res.redirect('/auth/register?msg=Registration failed, please try again.');
        }
    } catch (error) {
        return res.redirect(`/auth/register?msg=${error}`);
    }
});

app.get('/auth/logout', loggedInMiddleware, (req, res) => {
    res.clearCookie('auth');
    res.redirect('/auth/login');
});

app.get('/song/getSongsByUser', loggedInMiddleware, (req, res) => {
    const userId = req.user.id;
    db.getTracksByUser(userId).then((result) => {
        res.json(result);
    });
});

app.get('/song/get/:id', async (req, res) => {
    const songId = req.params.id;
    const trackStats = await db.getTrackStatsById(songId);
    if (!trackStats) {
        return res.status(404).send('Song not found');
    }
    const songPath = path.join('songs', trackStats.path);
    if (fs.existsSync(songPath)) {
        res.sendFile(path.resolve(songPath));
    } else {
        res.status(404).send('Song not found');
    }
});

app.get('/song/getCover/:id', async (req, res) => {
    const songId = req.params.id;
    const trackStats = await db.getTrackStatsById(songId);
    console.log(trackStats);
    if (!trackStats) {
        return res.status(404).send('Song not found');
    }
    const coverPath = path.join('covers', await trackStats.cover);
    if (fs.existsSync(coverPath)) {
        res.sendFile(path.resolve(coverPath));
    } else {
        res.status(404).send('Cover not found');
    }
});

fs.ensureDirSync('uploads');
fs.ensureDirSync('songs');
fs.ensureDirSync('covers');

app.get('/song/data/:id', async (req, res) => {
    const track = await db.getTrackStatsById(req.params.id);
    const stats = await track || { "error": "No data found" };
    res.json(await stats);
});

app.post('/song/submit', loggedInMiddleware, upload.fields([{ name: 'trackFile', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
    function removeTrackFiles(trackPath, coverPath) {
        if (fs.existsSync(trackPath)) {
            fs.unlinkSync(trackPath);
        }
        if (fs.existsSync(coverPath)) {
            fs.unlinkSync(coverPath);
        }
    }
    console.log(JSON.stringify(req.body));
    var { trackName, artist, album, year, genre } = req.body;
    const trackFile = req.files['trackFile'] ? req.files['trackFile'][0] : null;
    const coverFile = req.files['cover'] ? req.files['cover'][0] : null;

    if (coverFile) {
        var randomNumbers = Math.floor(100000 + Math.random() * 900000);
        var coverPath = `covers/${randomNumbers}-${coverFile.originalname}`;
        fs.moveSync(coverFile.path, coverPath);
    }
    
    if (trackFile) {
        var randomNumbers = Math.floor(100000 + Math.random() * 900000);
        var trackPath = `songs/${randomNumbers}-${trackFile.originalname}`;
        fs.moveSync(trackFile.path, trackPath);
    } else {
        removeTrackFiles(trackPath, coverPath);
        console.log('Please upload a track file');
        return res.status(400).send('Please upload a track file');
    }

    if (!trackName || !artist || !year || !genre || !trackFile) {
        removeTrackFiles(trackPath, coverPath);
        console.log('Please fill in all the fields');
        return res.status(400).send('Please fill in all the fields');
    }

    if (trackFile) {
        var length = await getAudioDurationInSeconds(trackPath);
    } else {
        var length = null;
    }

    const userId = req.user.id;
    if (isNaN(year) || isNaN(length)) {
        removeTrackFiles(trackPath, coverPath);
        console.log('Year abd length must be numbers');
        return res.status(400).send('Year and length must be numbers');
    }
    if (typeof userId !== 'number') {
        removeTrackFiles(trackPath, coverPath);
        console.log('Invalid user ID');
        return res.status(400).send('Invalid user ID');
    }

    try {
        coverPath = path.basename(coverPath);
        const result = await db.registerTrack(trackName, artist, album, year, genre, userId, path.basename(trackPath), Math.round(length), coverPath);
        if (result) {
            console.log('Track submitted successfully');
            fs.removeSync(trackFile.path);
            res.status(200).send('Track submitted successfully');
        } else {
            removeTrackFiles(trackPath, coverPath);
            console.log('Failed to submit track');
            res.status(500).send('Failed to submit track');
        }
    } catch (error) {
        removeTrackFiles(trackPath, coverPath);
        console.log(error);
        res.status(500).send('Failed to submit track');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

