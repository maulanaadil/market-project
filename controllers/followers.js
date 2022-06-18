const Twit = require('twit');
const _ = require('lodash');
const CronJob = require('cron').CronJob;
const moment = require('moment');
const async = require('async');
const request = require('request');

const UserFollowers = require('../models/UserFollower');
const ScheduleTweet = require('../models/Schedule');
const TrainingSet = require('../models/Testing');
const UserFollowerTimeline = require('../models/UserFollowerTimeline');
const Followers = require('../models/Followers');
const fs = require('fs');
const multer = require('multer');

exports.getAllFollowersUser = (req, res, next) => {
  const user = {
    userId: req.user._id,
    username: req.user.username,
  };

  UserFollowerTimeline.find(user, {
    userDetail: 1,
  }, (err, followers) => {
    res.status(200).json({
      statusCode: 200,
      message: 'success get all follower detail',
      followers,
    });
  });
};
/**
 * POST /user/followers/timeline/add
 */

exports.addUserTimeline = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });
  const param = {
      userId : req.user._id,
      "userDetail.userId" : req.body.user_id
  };
  UserFollowerTimeline.find(param,function(err,datas){
    if(err) console.log(err);
      if(datas.length === 0){
          let params = {
              user_id: Number(req.body.user_id),
              count: 200,
            };

            T.get('statuses/user_timeline', params, (err, timeline, response) => {
               if(err) console.log(err);
              async.waterfall([
                (callback) => {
                  let tweets = [];
                  let post = [];
                  timeline.map(tl => {

                    tweets.push({
                      text: tl.text,
                      time: new Date(tl.created_at),
                      lang: tl.lang,
                      category: '',
                    });
                    post.push({
                      tweet : tl.text,
                      categoryName : ''
                    });
                  });

                  callback(null, tweets, post);
                },
                (tweets, post, callback) => {
                  const posting =  JSON.stringify(
                                {
                                    "Inputs": {
                                      "input1": post
                                    },
                                    "GlobalParameters": {}
                                  }
                              ); //Set the body as a string
                        var categorys = request({
                               url: 'https://asiasoutheast.services.azureml.net/subscriptions/7a38336d77ae429085b6d8af7c3b5eeb/services/cb93407f21d84ecea1e837f3a5ee72ce/execute?api-version=2.0&format=swagger', //URL to hit
                               method: 'POST',
                               headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization':'Bearer 5R1krCG6+TvPBvh75/9KrTkfLpDTfy7jS7V8hVPmlEs2LNVUK8N511Ppu34+v48iPsghPLzQCP4gSCwuU+lOjQ=='
                              },
                              body:posting
                              }, function(error, response, body){
                                      if(error) {
                                          console.log(error);
                                      } 
                                      var categoryUser = '';
                                      let health = 0;
                                      let foods = 0;
                                      let travel = 0;
                                      let fashion = 0;
                                      let sports = 0;
                                      let bodies = JSON.parse(body);
                                      let cats = bodies.Results.output1;
                                      cats.forEach(function(category){
                                        //console.log(category['Scored Labels'] );
                                          if(category['Scored Labels'] === 'Foods'){
                                            foods++;
                                          }else if(category['Scored Labels'] === 'Health'){
                                              health++;
                                          }else if(category['Scored Labels'] === 'Fashion'){
                                              fashion++;
                                          }else if(category['Scored Labels'] === 'Sports'){
                                              sports++;
                                          }else if(category['Scored Labels'] === 'Travel'){
                                              travel++;
                                          }
                                      });
                                      console.log(health);
                                      console.log(foods);
                                      console.log(travel);
                                      console.log(fashion);
                                      console.log(sports);
                                      
                                      if((health >= foods) && (health >= travel) && (health >= fashion) && (health >= sports)){
                                          categoryUser = 'Health';
                                      }else  if((foods >= health) && (foods >= travel) && (foods >= fashion) && (foods >= sports)){
                                          categoryUser = 'Foods';
                                      }  else  if((travel >= health) && (travel >= foods)  && (travel >= fashion) && (travel >= sports)){
                                          categoryUser = 'Travel';
                                      } else  if((fashion >= health) && (fashion >= foods) && (fashion >= travel) && (fashion >= sports)){
                                          categoryUser = 'Fashion';
                                      } else  if((sports >= health) && (sports >= foods) && (sports >= travel) && (sports >= fashion)){
                                          categoryUser = 'Sports';
                                      }
                                      //console.log(categoryUser); 
                                     if (tweets === 0) {
                                          tweets = null;
                                        }

                                        let data = {
                                          userId: req.user._id,
                                          username: req.user.username,
                                          userDetail: {
                                            userId: timeline[0].user.id_str,
                                            name: timeline[0].user.name,
                                            screenName: timeline[0].user.screen_name,
                                            location: timeline[0].user.location,
                                            description: timeline[0].user.description,
                                            followersCount: timeline[0].user.followers_count,
                                            friendsCount: timeline[0].user.friends_count,
                                            statusCount: timeline[0].user.statuses_count,
                                            lang: timeline[0].user.lang,
                                            image: timeline[0].user.profile_image_url_https,
                                            category : categoryUser,
                                          },
                                          tweets,
                                        };

                                        callback(null, data); 
                                    });

                  
                },
                (data, callback) => {
                  let newData = new UserFollowerTimeline(data);

                  newData.save((err, data) => {
                    if (err) next(err);
                    
                    res.status(201).json({
                      statusCode: 201,
                      message: 'Success , '+data.userDetail.name+' Category Is '+data.userDetail.category,
                    });
                  });
                },
              ]);
            });
      }else{
          res.status(201).json({
            statusCode: 201,
            message: 'User already classified'
          });
      }
  });
  
};

/**
 * GET /user/followers/category
 * GET USER FOLLOWER BY CATEGORY FOR BLAST TWEET
 */
exports.getUserFollowerCategory = (req, res, next) => {
  async.parallel({
    real : function(callback){
      const query = {
        userId: req.user._id,
        username: req.user.username,
        'userDetail.category': req.params.category,
      };
    
      UserFollowerTimeline.find(query, {
        userDetail: 1
      }, (err, data) => {
        callback(null, data);
      });
    },
    fake : function(callback){
      Followers.find({'userDetail.category' : req.params.category}, (err, data)=>{
        callback(null, data);
      });
    }
  }, (err, Results)=>{ 
      var a = (Results.real).concat(Results.fake);
      res.json({
        statusCode : 200,
        message : "success get follower "+req.params.category,
        followers : a
      });
  })
  
};

/**
 * GET USER FOLLOWERS TIMELINE
 * /api/user/followers/timeline
 */
exports.getUserFollowersTimeline = (req, res, next) => {
  console.log('GET USER TIMELINE');
  let T = {};
  let userId = {};

  if (req.user !== undefined) {
    T = new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: req.user.tokens.accessToken,
      access_token_secret: req.user.tokens.tokenSecret,
    });

    userId = {
      userId: req.user._id,
    };
  }

  const getTimeline = () => {
    console.log('GET USER TIMELINE STARTED');

    UserFollowers.findOne(userId, (err, data) => {
      if (data !== null) {
        if (data.pointer <= data.followers.length && data.followers !== null) {
          for (let i = (data.pointer + 1); i <= (data.pointer + 5); i++) {
            console.log(i);
            let params = {
              user_id: Number(data.followers[i]),
              count: 20,
            };

            UserFollowers.findOneAndUpdate(userId, {
              $set: {
                pointer: i,
              },
            }, (err, data) => {
              console.log(err);
            });

            console.log(i);
            console.log(params);

            T.get('statuses/user_timeline', params, (err, timeline, response) => {
              // ASYNC TASK FOR GET USER TIMELINE
              async.waterfall([
                callback => {
                  let data = [];
                  if (timeline.hasOwnProperty('errors')) {
                    callback(null, 'error');
                  } else if (timeline.hasOwnProperty('error')) {
                    callback(null, 'error');
                  } else if (timeline.length === 0) {
                    callback(null, 'error');
                  } else if (timeline === null) {
                    callback(null, 'error');
                  } else if (timeline === undefined) {
                    callback(null, 'error');
                  } else {
                    timeline.map(tl => {
                      data.push({
                        text: tl.text,
                        time: new Date(tl.created_at),
                        lang: tl.lang,
                        category: '',
                      });
                    });

                    callback(null, data);
                  }
                },

                (tweets, callback) => {
                  if (tweets === 'error') {
                    callback(null, 'error');
                  } else {
                    let data = {
                      userId: req.user._id,
                      username: req.user.username,
                      userDetail: {
                        userId: timeline[0].user.id_str,
                        name: timeline[0].user.name,
                        screenName: timeline[0].user.screen_name,
                        location: timeline[0].user.location,
                        description: timeline[0].user.description,
                        followersCount: timeline[0].user.followers_count,
                        friendsCount: timeline[0].user.friends_count,
                        statusCount: timeline[0].user.statuses_count,
                        lang: timeline[0].user.lang,
                        image: timeline[0].user.profile_image_url_https,
                        category: '',
                      },
                      tweets,
                    };

                    callback(null, tweets, data);
                  }
                },

                (tweets, data) => {
                  let tweetsPrepros = PreprocessingController.preprocessingFollowerTweets(tweets, data);
                },

                // TODO: Move this method to preprocessing.js
              ]);
            });
          }
        } else {
          getUserTimeline.stop();
        }
      }
    });
  };

  // CronJob get user timeline by userId
  const getUserTimeline = new CronJob({
    cronTime: '*/30 * * * * *',
    onTick: getTimeline,
    onComplete: () => {
      console.log('STOPPED');
    },

    start: false,
    timeZone: 'Asia/Jakarta',
  });

  const getFollowerCount = (callback) => {
    UserFollowers.findOne(userId, (err, user) => {
      console.log('Masuk ambil data length');
      if (user) {
        callback(null, user.followers.length, user.pointer);
      } else {
        callback(null);
      }
    });
  };

  const comparePointer = (followers, pointer, callback) => {
    if (req.user !== undefined) {
      console.log('USER GAK UNDEFINED');
      if (pointer <= followers) {
        console.log('Jalananin JOB');
        getUserTimeline.start();
      } else {
        console.log('STOPPED');
        getUserTimeline.stop();
      }
    }
  };

  if (req.user) {
    async.waterfall([
      getFollowerCount,
      comparePointer,
    ]);
  }
};

/**
 * Midlleware for get user ids
 */
exports.getUserFollowersIds = (req, res, next) => {
  let userId = {};

  const getUserFollowersIds = (callback) => {
    const T = new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: req.user.tokens.accessToken,
      access_token_secret: req.user.tokens.tokenSecret,
    });

    let params = {
      count: 5000,
      user_id: req.user.twitter,
    };

    T.get('followers/ids', params, (err, followers, response) => {
      if (err) next(err);
      let ids;
      if (followers.ids !== null && followers.ids !== undefined) {
        ids = followers.ids.map(id => id.toString());
      }

      const userId = {
        userId: req.user._id,
      };

      const newUserFollowers = new UserFollowers({
        userId: req.user._id,
        username: req.user.username,
        followers: ids,
        statusDone: false,
        pointer: -1,
      });

      // ADD DATA IF NO DATA FONUD
      UserFollowers.findOne(userId, (err, data) => {
        if (data === null || data === undefined) {
          console.log('SAVE DATA');
          newUserFollowers.save((err, userFollowers) => {
            if (err) next(err);

            console.log('Success add yang null');
            callback(null);
          });
        } else {
          console.log('Udah ada isinya brow');
          callback(null);
        }
      });
    });
  };

  if (req.user) {
    async.waterfall([
      getUserFollowersIds,
    ]);
  }
};
/**
 * POST /api/twitter/follows/:id
 */
exports.followUser = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });

  const userId = {
    user_id: req.params.id,
    follow: true,
  };

  T.post('friendships/create', userId, (err, data, response) => {
    res.status(201).json({
      statusCode: 201,
      message: `you follow  ${data.screen_name} `,
      data,
    });
  });
};

/**
 * POST /api/twitter/unfollow/:id
 */
exports.unfollowUser = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });

  const userId = {
    user_id: req.params.id,
  };

  T.post('friendships/destroy', userId, (err, data, response) => {
    res.status(201).json({
      statusCode: 204,
      message: `you unfollow <strong> ${data.screen_name} </strong>`,
      data,
    });
  });
};