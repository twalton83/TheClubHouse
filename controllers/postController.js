const Post = require('../models/post')

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
    const post = new Post({
        title: req.body.title,
        body : req.body.body,
        author : req.user._id
      }).save((err)=>{
        err ? next(err) : res.redirect("/")
      })
}

exports.posts_delete = async function(req, res, next){
   const deleted = await Post.findByIdAndDelete(req.body.postId, (err)=>{
       if(err){
           res.send('404')
       } else {
        res.redirect('/')
       }
   })
}

exports.create_get = (req, res)=>{
    res.render('create-message')
  }