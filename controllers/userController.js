const User = require('../models/user')
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

exports.user_get = (req, res) => {
    res.render("sign-up")
}

exports.signupValidation = [
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
  
exports.signup_post = function(req, res, next){
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()})
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
                res.redirect("/");
            });
            }
        });
    }
}


exports.joinValidation = [
    check('secretPass')
    .trim()
    .escape()
    .custom(value => {
      return value === '867-5309' ? value : Promise.reject('Not the password')
    })
  ]

exports.join_post = (req, res, next)=>{
    User.findByIdAndUpdate(req.user._id, { membership : true}, (err,result)=>{
      if(err){
        return next(err)
      } else{
        res.redirect("/")
      }  
  })
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
    User.findByIdAndUpdate(req.user._id, { admin : true}, (err,result)=>{
      if(err){
        return next(err)
      } else{
        res.redirect("/")
      }  
  })
}