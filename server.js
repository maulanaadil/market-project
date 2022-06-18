const express = require('express');
const path = require('path');
const logger = require('morgan');
const compression = require('compression');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo/es5')(session);
const mongoose = require('mongoose');
const passport = require('passport');
const FB = require('fb');
// Load environment variables from .env file
dotenv.load();

// Passport OAuth strategies
require('./config/passport');

const app = express();

mongoose.connect(process.env.MONGODB,function(){
  console.log('connected to '+process.env.MONGODB);
});
mongoose.connection.on('error', () => {
  console.log('MLab Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json({
  limit: '10mb',
}));
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '10mb',
}));
app.use(expressValidator());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'hahah secret kok',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: process.env.MONGODB,
    autoReconnect: true,
  }),
  cookie: {secure:false, maxAge: 365 * 24 * 60 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 31557600000,
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "DELETE, GET, POST");
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});
require('./controllers/cron');
app.use('/', require('./routes/user'));
app.use('/api', require('./routes/api'));
app.use('/api/v1',require('./routes/v1/api'));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/#/dashboard',
  failureRedirect: '/login',
}));
app.get('/auth/facebook',
passport.authenticate('facebook', {scope: ['publish_actions','user_friends', 'public_profile', 'user_posts'] }));

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/sss' }),
function(req, res) {
  if(req.user.facebookClassify === false){
    //classify friend

  }
  res.redirect('/');
});
// Production error handler

if (app.get('env') === 'production') {
  app.use((err, req, res) => {
    console.error(err.stack);
    // res.sendStatus(err.status || 500);
  });
}

// PAGE NOT FOUND HANDLER
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`);
});

module.exports = app;
