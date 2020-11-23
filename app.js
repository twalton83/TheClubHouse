const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const { match } = require("assert");
require("dotenv").config();
const User = require('./models/user')
const Post = require('./models/post')
const postController = require('./controllers/postController')

const mongoDb = process.env.MONGO_URI
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const app = express();
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static("public"));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        console.log('error')
        return done(err);
      }
      if (!user) {
        console.log('no user found')
        return done(null, false, { msg: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          return done(null, user);
        } else {
          // passwords do not match!
          return done(null, false, { msg: "Incorrect password" });
        }
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", postController.posts_get)
app.post("/", 
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
)

app.delete("/", postController.posts_delete)

const authenticated = (req,res,next) =>{
  req.isAuthenticated() ? next() : res.redirect('/')
}
const validation = [
  check('username', 'Username must be an email address')
  .exists()
  .bail()
  .isEmail()
  .bail(),
  check('password').isLength({min : 8})
  .exists()
  .withMessage('Password Must Be At Least 8 Characters')
  .bail(),
  check('passwordConf', 'Passwords don\'t match.')
  .exists()
  .custom((value, {req})=> value === req.body.password)
]


app.get("/sign-up", (req, res) => {
  res.render("sign-up");
});

app.post("/sign-up", (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hashedPass) => {
    if (err){
      res.redirect("/");
    } else {
      const user = new User({
        username: req.body.username,
        password: hashedPass,
        membership: false,
        firstName:  req.body.firstname,
        lastName: req.body.lastname
      }).save((err) => {
        if (err) {
          return next(err)
        };
        res.redirect("/");
      });
    }
  });
});

app.get('/join', authenticated, (req, res)=>{
  res.render('join-the-club')
})

const joinValidation = [
  check('secretPass')
  .trim()
  .escape()
  .custom(value => {
    return value === '867-5309' ? value : Promise.reject('Not the password')
  })
]
app.post('/join', authenticated, joinValidation, (req, res, next)=>{
    User.findByIdAndUpdate(req.user._id, { membership : true}, (err,result)=>{
      if(err){
        return next(err)
      } else{
        res.redirect("/")
      }  
  })
})

app.get('/admin', authenticated, (req, res)=>{
  res.render('admin')
})

const adminValidation = [
  check('secretPass')
  .trim()
  .escape()
  .custom(value => {
    return value === '678-999-8212' ? value : Promise.reject('Not the password')
  })
]
app.post('/admin', authenticated, adminValidation, (req, res, next)=>{
    User.findByIdAndUpdate(req.user._id, { admin : true}, (err,result)=>{
      if(err){
        return next(err)
      } else{
        res.redirect("/")
      }  
  })
})

app.get('/create-message', authenticated, (req, res)=>{
  res.render('create-message')
})

app.post('/create-message',authenticated, postController.posts_post)

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, () => console.log("Enter The Clubhouse."));
