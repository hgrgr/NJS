const express = require('express');
const { User,Post} = require('../models');
const {isLoggedIn,isNotLoggedIn} = require('./middlewares');


const router = express.Router();
//profile
router.get('/profile',isLoggedIn,(req,res)=>{
    res.render('profile', { title: '내 정보 - NodeBird', user:req.user});
})
//회원가입
router.get('/join',isNotLoggedIn,(req,res)=>{
    res.render('join', {
        title: '회원가입 - NodeBird',
        user: req.user,
        joinError: req.flash('joinError'),
    });
});

//메인 페이지

/*
router.get('/',(req,res,next)=>{
    res.render('main', {
        title: 'NodeBird',
        twits: [],
        user: req.user,
        loginError: req.flash('loginError'),
    });
});
*/



//메인 페이지
router.get('/',(req,res,next)=>{
    //console.log(req.user);
        Post.findAll({
        include: {
            model: User,
            attributes: ['id','nick'],
        },
        order: [['createdAt','DESC']],
    })
    .then((posts)=>{
     //   console.log(posts);
        res.render('main', {
            title: 'NodeBird',
            user: req.user,
            twits: posts,
            loginError: req.flash('loginError'),
        });
    })
    .catch((error)=>{
        //console.log("this is problem?this is problem?this is problem?this is problem?this is problem?")
        console.error(error);
        next(error);
    });
   
});

module.exports=router;