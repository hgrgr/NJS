const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/test', async(req,res,next)=>{
    try{
        if(!req.session.jwt){//세션에 저장된 토큰 없을 경우 요청해서 받아옴
            const tokenResult = await axios.post('http://localhost:8002/v1/token',{
                clientSecret: process.env.CLIENT_SECRET,
            });
            if(tokenResult.data && tokenResult.data.code === 200){//토큰 가져온것 성공하면 세션엔 저장
                req.session.jwt = tokenResult.data.token;
            } else {//토큰 발급 실패 
                return res.json(tokenResult.data);//data에 error 들어있음
            }
        }
        const result = await axios.get('http://localhost:8002/v1/test',{//토큰 테스트
            headers: { authorization: req.session.jwt },//토큰 헤더에 넣어서 보냄
        });
        return res.json(result.data);
    }catch(error){
        console.error(error);
        if(error.response.status ===419 ){
            return res.json(error.response.data);
        }
        return next(error);
    }
});

const request = async(req,api)=>{
    try {
        if(!req.session.jwt){ // 토큰 없으면 받아와야함
            const tokenResult = await axios.post('http://localhost:8002/v1/token',{
              clientSecret: process.env.CLIENT_SECRET,  
            });
            req.session.jwt = tokenResult.data.token;
        }
        return await axios.get(`http://localhost:8002/v1/${api}`,{
            headers: { authorization: req.session.jwt },
        });
    }catch(err){
        console.error(err);
        if(error.response.status < 500){
            return err.response;
        }
        throw err;
    }
}
router.get('/mypost', async(req,res,next)=>{
    try{
        const result = await request(req, '/posts/my');
        res.json(result.data);
    }catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/search/:hashtag', async(req,res,next)=>{
    try{
        const result = await request(
            req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`,);//한글 에러 나는거 막는것
        res.json(result.data);
    }catch(error){
        console.error(error);
        next(error);
    }
})
module.exports = router;