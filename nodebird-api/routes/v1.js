const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
const { User, Domain, Post, Hashtag } = require('../models');

const router = express.Router();

router.post('/token',async (req,res)=>{
    const { clientSecret } = req.body;
    console.log("실행 1실행 1실행 1실행 1실행 1실행 1실행 1",req.body);
    try{
        const domain =await Domain.findOne({
            where: { clientSecret },
            include: {
                model: User,
               attribute: ['nick', 'id'],
            },
        });
        console.log("실행22222222222222222222222222222222");
        if(!domain){//해당 정보 없을경우
            return res.status(401).json({
                code:401,
                message: '등록 x 도매인'
            });
        }
        const token = jwt.sign({
            id: domain.user.id,
            nick: domain.user.nick,
        }, process.env.JWT_SECRET,{
            expiresIn: '1m',
            issuer: 'nodebird',//발급자 
        });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다',
            token,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'server error',
        });
    }
});

router.get('/test',verifyToken,(req,res)=>{//verfiy(미들웨어에 있음 )에서 토큰 검증해준다
     res.json(req.decoded);
});

router.get('/posts/my',verifyToken, (req,res)=>{//자신 게시글 다가져옴
    Post.findAll({ where: { userId: req.decoded.id}})
    .then((posts) =>{
        console.log(posts);
        res.json({
            code: 200,
            payload: posts,
        });
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    })
});

router.get('/posts/hashtag/:title',verifyToken, async(req,res)=>{//해쉬태그 가져옴
    try {
        const hashtag = await Hashtag.findOne({ where: {title: req.params.title}})
        if(!hashtag){//해쉬태그 없을경우    
            return res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다.',
            });
        }
        const posts = await hashtag.getPosts();
        return res.json({
            code: 200,
            payload: posts,
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

module.exports = router;
