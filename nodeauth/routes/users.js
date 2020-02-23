var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
/* GET users listing. */

router.get('/register', function (req, res, next) {
    res.render('register', {
        'title': 'Register'
    });
});

router.post('/register', function (req, res, next) {
    //get form value
    var name_req = req.body.name;
    var email_req = req.body.email;
    var username_req = req.body.username;
    var password_req = req.body.password;
    var password2_req = req.body.password2;


    //check for images field
    if (req.files && req.files.profileimage) {
        console.log('upload file ');
        //file info
        var profileImageOriginalName    = req.files.profileimage.originalname;
        var profileImageName            = req.files.profileimage.name;
        var profileImageMime            = req.files.profileimage.mimetype;
        var profileImagePath            = req.files.profileimage.path;
        var profileImageExt             = req.files.profileimage.extension;
        var profileImageSize            = req.files.profileimage.size;
    } else {
        var profileImageName = 'noimage.png';
    }

    // form validation
    req.checkBody('name', 'Xin vui lòng nhập họ tên').notEmpty();
    req.checkBody('email', 'Xin vui lòng nhập email').notEmpty();
    req.checkBody('email', 'Không đúng định dạng').isEmail();
    req.checkBody('username', 'Xin vui lòng nhập tên tài khoản').notEmpty();
    req.checkBody('password', 'Xin vui lòng nhập password').notEmpty();
    req.checkBody('password2', 'Không trùng khớp').equals(req.body.password);

    //check for errors
    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors,
            name: name_req,
            email: email_req,
            username: username_req,
            password: password_req,
            password2: password2_req
        });
    } else {
        var newUser = new User({
            name: name_req,
            email: email_req,
            username: username_req,
            password: password_req,
            profileimage: profileImageName
        });

        //crete User
        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });

        //success message
        req.flash('success', 'Bạn đã đăng ký thành công!');
        res.location('/');
        res.redirect('/');
    }
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        'title': 'Login'
    });
});

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function (id, done){
    User.getUserById(id, function(err, user){
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
            if (err) throw err;
            if (!user) {
                console.log('Unknown User');
                return done(null, false, {message: 'Unknown User'});
            }
            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch) {
                    return done(null, user);
                } else {
                    console.log('Lỗi mật khẩu');
                    return done(null, false, {message: 'Lỗi mật khẩu'});
                }
            });
        });
    }
));

router.post('/login', passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login'}), function (req, res) {
    console.log('Authentication Success!');
    req.flash('success', 'Bạn đã đăng nhập thành công');
    res.redirect('/');
});

router.get('/logout', function (req, res){
    req.logout();
    req.flash('success', 'Bạn đã đăng xuất thành công');
    res.redirect('/users/login');
});

module.exports = router;
