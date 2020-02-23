var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

router.get('/', function(req, res, next) {
    res.render('contact', { title: 'Contact' });
});

router.post('/send', function (req, res, next){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'nguyenvananhttht@gmail.com',
            pass: 'fitchelaba'
        }
    });

    var mailOptions = {
        from: 'Vân Anh <nguyenvananhttht@gmail.com>',
        to: 'nguyenducquangttht@gmail.com',
        subject: 'Express Website',
        text: 'Chào mừng '+ req.body.name +' đã đến với hệ thống website của chúng tôi. Tài khoản của quý khách là: '+ req.body.email +' với thông tin thêm là: '+ req.body.message,
        html: '<p>Bạn có thể đến với những chương trình mà bạn từng nghĩ đến</p><ul><li>Name: '+req.body.name+'</li><li>Email: '+req.body.email+'</li><li>Message: '+req.body.message+'</li></ul>'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
            res.redirect('/');
        } else {
            console.log('Message Send: ' + info.response);
            res.redirect('/');
        }
    })
});

module.exports = router;
