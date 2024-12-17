const express = require('express');
const path = require('path');
var db = require('./db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs-extra');

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
                res.redirect('/auth/login');
                console.log(err);
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

app.get('/song/:name', async (req, res) => {
    const songName = path.basename(req.params.name);
    const songPath = path.join(__dirname, 'songs', songName);
    if (fs.existsSync(songPath)) {
        res.sendFile(path.resolve(songPath));
    } else {
        res.status(404).send('Song not found');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});