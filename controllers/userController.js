const User = require('../models/user')
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const passport = require('passport');

exports.user_get = (req, res) => {
    res.render("sign-up", {errors: undefined})
}

exports.signupValidation = [
    check('username', 'Username must be an email address')
    .exists()
    .bail()
    .isEmail()
    .bail(),
    check('password', 'Password must be at least 8 characters')
    .isLength({min : 8})
    .exists()
    .bail(),
    check('passwordConf', 'Passwords don\'t match.')
    .exists()
    .custom((value, {req})=> value === req.body.password)
  ]
  
exports.signup_post = function(req, res, next){
    const errors = validationResult(req)
    console.log(errors)
    if(!errors.isEmpty()){
      res.render('sign-up', {errors: errors.array()})
    } else {
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
                passport.authenticate('local')(req,res, ()=>{
                  return res.redirect("/")
                })
            });
            }
        });
    }
}

exports.joinValidation = [
    check('secretPass', 'Not the secret password')
    .trim()
    .escape()
    .custom(value => {
      return value === '867-5309'
    })
  ]

exports.join_post = (req, res, next)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    res.render('join-the-club', {errors: errors.array()})
  } else {
    User.findByIdAndUpdate(req.user._id, { membership : true}, (err,result)=>{
      if(err){
        return next(err)
      } else{
        res.redirect("/")
      }  
  })
  }
}

exports.adminValidation = [
    check('secretPass')
    .trim()
    .escape()
    .custom(value => {
      return value === '678-999-8212' ? value : Promise.reject('Not the password')
    })
  ]

exports.admin_post = (req, res, next)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    res.render('admin', {errors: errors.array()})
  } else {
    User.findByIdAndUpdate(req.user._id, { admin : true}, (err,result)=>{
      if(err){
        return next(err)
      } else{
        res.redirect("/")
      }  
    })
  }
}