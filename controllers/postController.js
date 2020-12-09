const Post = require('../models/post')
const { body, validationResult } = require('express-validator');

exports.posts_get = function(req, res, next){
    Post.find()
    .populate('author')
    .exec(function (err, posts){
        if(err){
            return next(err)
        } else {
            res.render('index', {posts : posts})
        }
    })
}

exports.posts_post = function(req,res, next){
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.render('sign-up', {errors: errors.array()})
    } else {
    const post = new Post({
        title: req.body.title,
        body : req.body.body,
        author : req.user._id
      }).save((err)=>{
        err ? next(err) : res.redirect("/")
      })
    }
}

exports.posts_delete = async function(req, res, next){
console.log(req.params)
   const deleted = await Post.findByIdAndDelete(req.params.post_id, (err)=>{
       if(err){
        res.json({success: false})
       } else {
        res.redirect('/')
       }
   })
}

exports.create_get = (req, res)=>{
    res.render('create-message', {errors: undefined})
  }

exports.post_validation = [
    body('body')
    .not().isEmpty()
    .trim()
    .escape()
]