const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require('./models/user')
const postController = require('./controllers/postController')
const userController = require('./controllers/userController')

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

const authenticated = (req,res,next) =>{
  req.isAuthenticated() ? next() : res.redirect('/')
}
const isAdmin = (req,res,next) => {
  console.log(req.user.admin)
  req.user.admin ? next() : res.redirect("/")
}

app.get("/", postController.posts_get)
app.post("/", 
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
)
app.get("/:post_id/delete", isAdmin, postController.posts_delete)

app.get("/sign-up", userController.user_get);
app.post("/sign-up", userController.signupValidation, userController.signup_post);

app.get('/join', authenticated, (req, res)=>{
  res.render('join-the-club')
})
app.post('/join', authenticated, userController.joinValidation, userController.join_post)

app.get('/admin', authenticated, (req, res)=>{
  res.render('admin')
})
app.post('/admin', authenticated, userController.adminValidation, userController.admin_post)

app.get('/create-message', authenticated, postController.create_get)
app.post('/create-message', authenticated, postController.posts_post)

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(process.env.PORT, () => console.log("Enter The Clubhouse."));
