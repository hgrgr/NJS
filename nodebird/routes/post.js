const express= require('express');
const multer = require('multer');
const path = require('path');
const { User, Post } = require('../models');
const {Hashtag} = require('../models');
const {isLoggedIn} = require('./middlewares');

const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination(req,file, cb){
            cb(null,'uploads/');
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext)+ Date.now() + ext);
        },
    }),
    limits: { fileSize: 5*1024*1024},
});
router.post('/img',isLoggedIn,upload.single('img'),(req,res)=>{
    console.log(req.file);
    res.json({ url: `/img/${req.file.filename}`});
});

const upload2 = multer();

 router.post('/',isLoggedIn,upload2.none(), async (req,res,next)=>{
   //  console.log(req.user.id);
     try{
         const post = await Post.create({
             content: req.body.content,
             img: req.body.url,
             userId: req.user.id,
    
         });
        
         const hashtages = req.body.content.match(/#[^\s#]*/g);
         if(hashtages){
             const result = await Promise.all(hashtages.map(tag => Hashtag.findOrCreate({
                 where: { title: tag.slice(1).toLowerCase()},//슬라이스로 샵 때고 toLowerCase로 소문자로 바꿔서 중복 제거
             })));
             await post.addHashtags(result.map(r => r[0])); //다대다 관계 맺어주는거임
        }
         res.redirect('/');
     }catch(err){
         console.error(err);
         next(err);
     }
 });


router.get('/hashtag', async (req,res,next)=>{
    const query = req.query.hashtag;
    if(!query){
        return res.redirect('/');
    }
    try{
        const hashtag = await Hashtag.findOne({ where: { title: query }});
        let posts=[];
        if(hashtag){
            posts = await hashtag.getPosts({include: [ { model: User }]});
        }
        return res.render('main', {
            title: `${query} | NodeBird`,
            user: req.user,
            twits: posts,
        });
    }catch(err){
        console.error(err);
        return next(err);
    }
});

module.exports = router;