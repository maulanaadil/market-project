const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterAdsAPI = require('twitter-ads');
const async = require('async');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Sign in with Email and Password
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (!user) {
      return done(null, false, { msg: 'The email address ' + email + ' is not associated with any account. ' +
      'Double-check your email address and try again.' });
    }

    // user.comparePassword(password, (err, isMatch) => {
    //   if (!isMatch) {
    //     return done(null, false, { msg: 'Invalid email or password' });
    //   }
    //
    //   return done(null, user);
    // });

    if (password === user.password) {
      return done(null, user);
    } else {
      return done(null, false, { msg: 'Invalid password' });
    }
  });
}));

// Sign in with Twitter *yang dipakai yang ini 
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: '/auth/twitter/callback',
  passReqToCallback: true,
}, (req, accessToken, tokenSecret, profile, done) => {
  //cek user udah login belum, cek session user
  if (req.user) {
    //cek user udah pernah login belum
    User.findOne({ twitter: profile.id }, (err, user) => {
      if (user) {
        req.flash('error', { msg: 'There is already an existing account linked with Twitter that belongs to you.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          user.name = user.name || profile.displayName;
          user.tokens.push({
            accessToken,
            tokenSecret,
          });
          user.location = user.location || profile._json.location;
          user.picture = user.picture || profile._json.profile_image_url_https;
          user.twitter = profile.id;
          user.save((err) => {
            req.flash('success', { msg: 'Your Twitter account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    //kalo session ada maka cek ulang *session di save ke db sebelumnya auto dari passport.js
    User.findOne({ twitter: profile.id }, (err, existingUser) => {
      if (existingUser) {
          //kalo user ada maka update access token twitter & token secret menghindari error kalo ganti key twitter
            async.waterfall([
              (callback)=>{
                User.findByIdAndUpdate(existingUser._id, {$set:{
                    tokens: {
                      accessToken,
                      tokenSecret,
                    }
                  }}, (err, data)=>{
                      if(err)
                        console.log(err)
          
                      console.log('update token')
                      callback(null, data);
                  });
              },
              (account, callback)=>{
                //habis update akses toket, ngambil data twitter ads dari pengguna
                console.log(account);
                if(existingUser.twitterAds !== null){
                  callback(null, account);
                }
                var T = new TwitterAdsAPI({
                  consumer_key: process.env.TWITTER_KEY,
                  consumer_secret: process.env.TWITTER_SECRET,
                  access_token: account.tokens.accessToken,
                  access_token_secret: account.tokens.tokenSecret,
                  sandbox: false, // defaults to true
                  api_version: '4' //defaults to 2
                });
                T.get('/accounts/', (err, twitter, response) => {
                  if(err){
                    console.log(err);
                  }else{
                      console.log('masook pak ekoo')
                      User.findByIdAndUpdate(existingUser._id, {$set:{
                        twitterAds : response.data
                      }}, (err, data)=>{
                          if(err)
                            console.log(err)
              
                          console.log('update account detail')
                          callback(null, data);
                      });
                  }
              });
            }
            ], (err, results)=>{
              return done(null, results);
            })
          
      }else{
              // Twitter does not provide an email address, but email is a required field in our User schema.
            // We can "fake" a Twitter email address as follows: username@twitter.com.
            // Ideally, it should be changed by a user to their real email address afterwards.
            // For example, after login, check if email contains @twitter.com, then redirect to My Account page,
            // and restrict user's page navigation until they update their email address.
            var T = new TwitterAdsAPI({
              consumer_key: process.env.TWITTER_KEY,
              consumer_secret: process.env.TWITTER_SECRET,
              access_token: accessToken,
              access_token_secret: tokenSecret,
              sandbox: false, // defaults to true
              api_version: '4' //defaults to 2
            });
            T.get('/accounts/', (err, twitter, response) => {
              if(err){
                console.log(err)
              }else{
                  console.log('masook pak ekoo')
                  User.findByIdAndUpdate(existingUser._id, {$set:{
                    twitter_ads : response.data
                  }}, (err, data)=>{
                      if(err)
                        console.log(err)
          
                        console.log('REGISTER');
                        console.log(profile);
                        console.log('FINISH REGISTER');
                        const newUser = new User({
                          name: profile.displayName,
                          email: profile.username + '@twitter.com',
                          username: profile.username,
                          role: 'user',
                          tokens: {
                            accessToken,
                            tokenSecret,
                          },
                          location: profile._json.location,
                          picture: profile._json.profile_image_url_https,
                          twitterAds : response.data,
                          twitter: profile.id,
                          facebookId : '',
                          facebookToken : '',
                          facebookClassify : false,
                          classified : false
                        });
                  
                        newUser.save(err => {
                          done(err, newUser);
                        });
                  });
              }
          });
      }
      
    });
  }
}));

passport.use(new FacebookStrategy({
  clientID: '512930379088087',
  clientSecret: '311c29efaf6cf8829b65acecc8dffa09',
  callbackURL: "/auth/facebook/callback",
  passReqToCallback: true,
},
function(req, accessToken, refreshToken, profile, cb) {
  User.find({ facebookId: profile.id }, function (err, user) {
    console.log(profile)
    console.log(refreshToken)
    if(user.length !== 0){
      User.findByIdAndUpdate(req.user._id, {$set:{
          facebookToken : accessToken
      }}, (err, user)=>{
        return cb(err, user);
      })
    }else{
      User.findByIdAndUpdate(req.user._id, {$set:{
        facebookId : profile.id,
        facebookToken : accessToken
      }}, (err, user)=>{
        return cb(err, user);
      })
    }
  });


}
));
