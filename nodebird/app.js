const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

require('dotenv').config();

const userRouter = require('./routes/user');
const indexRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');

const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('view engine','pug');
app.set('views', path.join(__dirname,'views'));
app.set('port',process.env.PORT || 8001); 

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/img',express.static(path.join(__dirname,'uploads')));//실제경로와 포론트 접근경로 다르게 표기한것 img가 프론트엔서 접근시 하는 경로
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/user',userRouter);
app.use('/auth',authRouter);
app.use('/post',postRouter);

app.use((req,res,next)=>{
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err,req,res)=>{
    res.locals.message = err.message;
    res.locals.err = req.app.get('env') ==='development'? err : {};
    res.status(err.status || 500);
    res.render('error')
});

app.listen(app.get('port'),()=>{
    console.log(`${app.get('port')} port listen`);
});