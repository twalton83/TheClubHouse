const Post = require('../models/post')

exports.posts_get = function(req, res, next){
    Post.find()
    .populate('author')
    .exec(function (err, posts){
        if(err){
            return next(err)
        } else {
            console.log(posts)
            res.render('index', {posts : posts})
        }
    })
}

exports.posts_post = function(req,res, next){
    console.log(req)
    const post = new Post({
        title: req.body.title,
        body : req.body.body,
        author : req.user._id
      }).save((err)=>{
        err ? next(err) : res.redirect("/")
      })
}

exports.posts_delete = function(req, res, next){
    
}