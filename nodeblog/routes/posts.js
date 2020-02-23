var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({storage: storage});

router.get('/show/:id', function (req, res, next) {
    var posts = db.get('posts');
    posts.findOne({_id: req.params.id}, {}, function (err, post) {
        res.render('show', {
            'post': post
        });
    });
});

router.get('/add', function (req, res, next) {
    var categories = db.get('categories');
    categories.find({}, {}, function (err, categories) {
        res.render('addpost', {
            "title": "Add Post",
            "categories": categories
        });
    });

});

router.post('/add', upload.single('mainimage'), function (req, res, next) {
    // //get form value
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();

    if (req.file) {
        var mainImageName = req.file.originalname;
        var mainImageMime = req.file.mimetype;
        var mainImagePath = req.file.path;
        var mainImageSize = req.file.size;
    } else {
        var mainImageName = 'noimage.png';
    }

    //form validator
    req.checkBody('title', 'Tiêu đề không được bỏ trống').notEmpty();
    req.checkBody('body', 'Nội dung không được bỏ trống').notEmpty();

    //check error
    var errors = req.validationErrors();

    if (errors) {
        res.render('addpost', {
            "errors": errors,
            "title": title,
            "body": body
        });
    } else {
        var posts = db.get('posts');

        //insert to db
        posts.insert({
            "name": name,
            "body": body,
            "category": category,
            "date": date,
            "author": author,
            "mainimage": mainImageName
        }, function (err, post) {
            if (err) {
                res.send('There was an issue submitting the post');
            } else {
                req.flash('success', 'Post summitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

router.post('/show/addcomment', upload.single('mainimage'), function (req, res, next) {
    // //get form value
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postid = req.body.postid;
    var commentdate = new Date();

    //form validator
    req.checkBody('name', 'Tên không được bỏ trống').notEmpty();
    req.checkBody('email', 'Email không được bỏ trống').notEmpty();
    req.checkBody('email', 'Email định dạng không đúng').isEmail();
    req.checkBody('body', 'Nội dung không được bỏ trống').notEmpty();

    //check error
    var errors = req.validationErrors();

    if (errors) {
        var posts = db.get('posts');
        posts.findOne({_id: req.params.id}, {}, function (err, post) {
            res.render('show', {
                "errors": errors,
                "post": post
            });
        });
    } else {
        var comment = {"name": name, "email": email, "body": body, "commentdate": commentdate};
        var posts = db.get('posts');
        //insert to db
        posts.update(
            {
                "_id": postid,
            },
            {
                $push: {
                    "comment": comment
                }
            }, function (err, doc) {
                if (err) {
                    throw err;
                } else {
                    req.flash('success', 'Thêm bình luận thành công');
                    res.location('/posts/show/' + postid);
                    res.redirect('/posts/show/' + postid);
                }
            }
        );
    }
});

module.exports = router;