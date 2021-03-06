const express = require('express');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
// 
const app = express();
const port = 5000;

// allow for method override
app.use(methodOverride('_method'));

// Express session middleware 
app.use(session({
    secret: 'azxvbexsgjamhgvlwkdhj',
    resave: true,
    saveUninitialized: true
}));

// flash msg
app.use(flash());

// global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Connect to mongoose
mongoose.connect('mongodb://localhost/videa', {
    useNewUrlParser: true 
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');


// Index route
app.get('/', (req, res) => {
    const title = 'Videa';
    res.render('index', {
        title
    });
});

// About route
app.get('/about', (req, res) => {
    res.render('about');
});

// Idea Index Page
app.get('/ideas', (req, res) => {
    Idea.find({})
        .sort({date: 'desc'})
        .then(ideas => {
            res.render('ideas/index', {
                ideas
            });
        });
});

// Add Idea Form route
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

// Edit Idea Form route
app.get('/ideas/edit/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            res.render('ideas/edit', {
                idea
            });
        });
});

// Submit Idea Route
app.post('/ideas', (req, res) => {
    let errors = [];

    if (!req.body.title) {
        errors.push({text: 'Please add a title'});
    }
    if (!req.body.details) {
        errors.push({text: 'Please add some details'});
    }

    if (errors.length > 0) {
        res.render('ideas/add', {
            errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
        };
        new Idea(newUser)
            .save()
            .then(() => {
                req.flash('success_msg', 'Video idea added!')
                res.redirect('/ideas');
            });
    }
});

// Submit Idea Edit Route
app.put('/ideas/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
        // new values
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save()
                .then(() => {
                    req.flash('success_msg', 'Video idea updated!')
                    res.redirect('/ideas');
                });
        });
});

// Delete Idea
app.delete('/ideas/:id', (req, res) => {
    Idea.deleteOne({_id: req.params.id})
        .then(() => {
            req.flash('success_msg', 'Video idea removed!')
            res.redirect('/ideas');
        });
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});