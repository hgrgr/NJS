const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require("./middlewares");
const { User } = require('../models');


const router = express.Router();

router.post('/join',isNotLoggedIn, async (req,res,next)=>{//회원가입
    const { email, nick, password } = req.body;
    try{
        const exUser = await User.findOne({ where: { email }});
        if(exUser){
            console.log("실행 하고 이ㅣㅆ니?실행 하고 이ㅣㅆ니?실행 하고 이ㅣㅆ니?실행 하고 이ㅣㅆ니?");
            req.flash('joinError ', '이미 가입된 이메일 입니다');
            return res.redirect('/join');
        }
        const hash = await bcrypt.hash(password,12);
        await User.create({
            email,
            nick,
            password: hash,
        });
        console.log("제대로 실행제대로 실행제대로 실행제대로 실행제대로 실행제대로 실행");
        return res.redirect('/');
    }catch(error){
        console.error(error);
        return next(err);
    }   
});


router.post('/login',isNotLoggedIn,(req,res,next)=>{//로그인
   passport.authenticate('local',(authError, user, info)=>{//local의 done에 담기는것들임 (err,user,info)
        if(authError)
        {
            console.error(authError);
            return next(authError);
        }
        if(!user){
            req.flash('loginError', info.message);
            return res.redirect('/');
        }
        return req.login(user, (loginError) => {//req.user에 저장됨 정보
            if(loginError){
                console.error(loginError);
                next(loginError);
            }
            return res.redirect('/');
        });
   })(req,res, next);
});

router.get('/logout', isLoggedIn, (req,res,next)=>{
    req.logout();
    req.session.destroy();//req.user에 저장된 정보 없애버림
    res.redirect('/');
})

router.get('/kakao',passport.authenticate('kakao'));//여기서 카카오 스트레이지 실행할수 있게 해야함

router.get('/kakao/callback', passport.authenticate('kakao',{
    failureRedirect:'/',   
}),(req,res)=>{
    res.redirect('/');
});//여기선 카카오 스트레이지에서 받은 콜백함수 처리(카카오 스트레지에 전달해줌) 이건 그냥 요청 받기만 하는거임
/*
router.post('/login',(req,res,next)=>{//로그인
    const { email, password } = req.body;
    try{
        const exUser = await User.find({where:{email}});
        if(exUser){//있을경우 비번 검사
           const hapassword = await User.find({where:})
        }
        const hash = await bcrypt.hash(password,12);
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('./');
    }catch(error){
        console.error(error);
        next(err);
    }
});
*/
module.exports = router;