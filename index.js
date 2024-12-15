const express = require('express');
const path = require('path');
var db = require('./db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3000;

const generalMiddleware = (req, res, next) => {
    res.locals.message = req.query.msg;
    next();
};

const loggedInMiddleware = (req, res, next) => {
    if (req.cookies.user) {
        jwt.verify(req.cookies.user, process.env.AUTH_SECRET, (err, decoded) => {
            if (err) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        });
        next();
    } else {
        res.redirect('/auth/login');
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

app.get('/auth/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await db.loginUser(username, password);
    res.redirect("/?msg=" + await result);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});