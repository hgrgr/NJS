const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');

const {User} = require('../models');


module.exports = (passport) => {
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });
    passport.deserializeUser((id, done)=>{
      //  if(user[id]){//디비 요청 줄이기 위한 캐싱
     //       done(user[id]);
      //  }else{
        User.findOne({
          where:{id},
          include:[{ //팔로워 가져옴
          model: User,
          attributes: ['id','nick'],
          as: 'Followers',
        },{//팔로잉 가져옴
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followings',
        }],
      })
        .then(user => done(null,user))
        .catch(err=>done(err));
     //   }
    });

    local(passport);
    kakao(passport);
}
