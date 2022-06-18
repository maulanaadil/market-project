const Twit = require('twit');
const _ = require('lodash');
const CronJob = require('cron').CronJob;
const moment = require('moment');
const async = require('async');
const request = require('request');

const UserFollowers = require('../../models/UserFollower');
const ScheduleTweet = require('../../models/Schedule');
const TrainingSet = require('../../models/Testing');
const User = require('../../models/User');
const UserFollowerTimeline = require('../../models/UserFollowerTimeline');
const fs = require('fs');
const multer = require('multer');

exports.getTimeline = (req, res, next)=>{
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
  });
  T.get('statuses/home_timeline', (err, data, response)=>{
      if(err)
        console.log(err)

      res.json({
        status_code : 200,
        message : "Success get feed timeline",
        data : data
      });
  });
}
exports.getTrends = (req, res, next)=>{
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
  });
  T.get('trends/place',{id : "23424846"}, (err, data, response)=>{
      if(err)
        console.log(err)

      res.json({
        status_code : 200,
        message : "Success get trends",
        data : data
      });
  });
}
exports.mention = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
  });
  T.get('statuses/mentions_timeline', { count: 30 },
    (err, data, response) => {
      let mention = {
        status_code: 200,
        messages: 'Success get mentions',
        data: data
      }
      res.json(mention);
    });
};

/**
 * POST /api/user/post
 */

function getFollowersIds(){

}
function tweetClassification(T,flwr){

}

let follower = {};
exports.dashboard = (req,res,next)=>{
  async.waterfall([
    function getHealth(callback) {
        const params = {
          username : req.body.username,
          "userDetail.category" : "Life Style"
        };
        UserFollowerTimeline.count(params, (err, count) => {
          follower.Life = count;
          console.log("jumlah : "+count);
          callback(null, follower);
        });
      },
     function getHealth(follower,callback) {
        const params = {
          username : req.body.username,
          "userDetail.category" : "Foods"
        };
        UserFollowerTimeline.count(params, (err, count) => {
          follower.Foods = count;
          console.log("jumlah : "+count);
          callback(null, follower);
        });
      },
     function getHealth(follower,callback) {
        const params = {
          username : req.body.username,
          "userDetail.category" : "Fashion"
        };
        UserFollowerTimeline.count(params, (err, count) => {
          follower.Health = count;
          console.log("jumlah : "+count);
          callback(null, follower);
        });
      },
      function getHealth(follower,callback) {
        const params = {
          username : req.body.username,
          "userDetail.category" : "Travel"
        };
        UserFollowerTimeline.count(params, (err, count) => {
          follower.Travel = count;
          console.log("jumlah : "+count);
          callback(null, follower);
        });
      },
      function getHealth(follower,callback) {
        const params = {
          username : req.body.username,
          "userDetail.category" : "Sports"
        };
        UserFollowerTimeline.count(params, (err, count) => {
          follower.Sports = count;
          console.log("jumlah : "+count);
          callback(null, follower);
        });
      },
    function (follower, callback) {
      res.status(200).json({
        statusCode: 200,
        message: 'success get all follower count',
        follower,
      });
    },
  ], (err, result) => {
    console.log(err);
    console.log(result);
  });
};

exports.timelines = (req,res,next)=>{
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });
  let params = {
    user_id: Number(req.params.id),
    count: 100,
  };

  T.get('statuses/user_timeline', params, (err, timeline, response) => {
      res.json(timeline);
  });
}
exports.postTweet = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
  });

  T.post('/statuses/update', {
    status: req.body.tweet,
    lat: req.body.lat,
    long: req.body.long,
  }, (err, twitter, response) => {
    if (response.statusCode === 200) {
      res.status(201).json({
        statusCode: response.statusCode,
        message: 'Tweet berhasil di post',
        tweet: req.body.tweet,
      });
    } else {
      res.json({
        statusCode: 500,
        message: 'Cek kembali tweet anda',
        err,
      });
    }
  });
};

exports.postImage = (req,res,next)=> {
  console.log(req.body.access_token);
  var storage = multer.diskStorage({

          filename : function(req,file,callback){
            callback(null,file.originalname);
          }
      });
  var upload = multer({storage:storage}).single('image');
  upload(req,res,function(err){

        if(err)
          console.log(err);

          const T = new Twit({
            consumer_key: process.env.TWITTER_KEY,
            consumer_secret: process.env.TWITTER_SECRET,
            access_token: req.body.access_token,
            access_token_secret: req.body.token_secret,
          });
          var b64content = fs.readFileSync(req.file.path, { encoding: 'base64' });
          T.post('media/upload', { media_data: b64content }, function (err, data, response) {

            var mediaIdStr = data.media_id_string
            var altText = req.body.tweet;
            var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

            T.post('media/metadata/create', meta_params, function (err, data, response) {
              if (!err) {
                var params = { status: req.body.tweet, media_ids: [mediaIdStr] }

                T.post('statuses/update', params, function (err, data, response) {
                  console.log(data)
                })
              }
            });
            if (response.statusCode === 200) {
              res.status(201).json({
                statusCode: response.statusCode,
                message: 'Tweet berhasil di post',
                tweet: req.body.tweet,
              });
            } else {
              res.json({
                statusCode: 500,
                message: 'Cek kembali tweet anda',
                err,
              });
            }
          });

      });

};

/**
 * POST /api/user/blast/post
 */
exports.blastTweet = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret
  });

  let listTweet = req.body;
  console.log(listTweet);
  async.waterfall([
    postTweet,
    (callback) => {
      res.json({
        statusCode: 201,
        message: 'all tweet has been posted',
      });
    },
  ]);

  function postTweet(callback) {
        const query = {
          userId: req.body._id,
          username: req.body.username,
          'userDetail.category': req.body.category,
        };
        console.log(query);
        UserFollowerTimeline.find(query, {
          userDetail: 1}, (err, data) => {
            data.map(flwr =>{

                  tweet = req.body.tweet;
                  tweets = tweet.replace(/\${mention}/g, '@' + flwr.userDetail.screenName);
                  console.log(tweets);
                  let data = {
                        status: tweets,
                  };

                  T.post('/statuses/update', data, (err, twtter, response) => {
                    if (response.statusCode === 200) {

                    } else {
                      return res.json({
                        statusCode: 500,
                        message: 'Cek kembali tweet anda',
                        err,
                      });
                    }
                  });

            });
           });
          callback(null);
        }
};

/**
 * GET /api/user/post/schedule
 */
exports.getScheduleTweets = (req, res, next) => {
  ScheduleTweet.find({
    userId: req.params.id,
  }, (err, data) => {
    if (err) {
      throw err;
    }

    if (data.length !== 0) {
      data.map((datum, i) => {
        data[i].countDown = moment(data[i].time).fromNow();
      });
    }

    const sortedData = _.orderBy(data, ['time', 'asc']);

    res.json({
      statusCode: 200,
      message: 'succes',
      data: sortedData,
    });
  });
};

/**
 * DELETE /api/user/post/schedule/:id
 */
exports.deleteScheduleTweet = (req, res, next) => {
  let id = req.params.id;

  ScheduleTweet.findByIdAndRemove(id, (err, data) => {
    res.json({
      statusCode: 200,
      message: `${id} telah dihapus`,
    });
  });
};

/**
 * POST /api/user/post/schedule
 */
exports.newScheduleTweet = (req, res, next) => {
  var tokens = {
    accessToken: req.body.access_token,
    tokenSecret: req.body.token_secret,
  };
  const schedule = {
    token: tokens,
    tweet: req.body.tweet,
    userId: req.body._id,
    lat: req.body.lat,
    long: req.body.long,
    time: new Date(req.body.date),
    countDown: '',
  };
  console.log(schedule);
  const newSchedule = new ScheduleTweet(schedule);

  newSchedule.save((err, data) => {
    if(err){
        res.json({
          statusCode : 400,
          message : err
        });
     }
    res.status(201).json({
      data,
      statusCode: 201,
      message: 'Tweet berhasil disimpan',
    });
  });
};
  exports.scheduleWithImage = (req,res,next)=> {

  var storage = multer.diskStorage({

          filename : function(req,file,callback){
            callback(null,file.originalname);
          }
      });
  var upload = multer({storage:storage}).single('image');
  upload(req,res,function(err){

        if(err)
          console.log(err);
           var tokens = {
            accessToken: req.body.access_token,
            tokenSecret: req.body.token_secret,
          };
          var b64content = fs.readFileSync(req.file.path, { encoding: 'base64' });
          const schedule = {
                      token: tokens,
                      tweet: req.body.tweet,
                      userId: req.body._id,
                      lat: req.body.lat,
                      long: req.body.long,
                      image : b64content,
                      time: new Date(req.body.date),
                      countDown: '',
                };
           console.log(schedule);
           const newSchedule = new ScheduleTweet(schedule);

           newSchedule.save((err, data) => {
              res.status(201).json({
                    data,
                    statusCode: 201,
                    message: 'Tweet berhasil disimpan',
               });
            });

      });

};



/**
 * PUT /user/post/schedule/:id
 */
exports.updateScheduleTweet = (req, res, next) => {
  const id = req.params.id;
  const update = {
    tweet: req.body.tweet,
  };
  ScheduleTweet.findOneAndUpdate({
    _id: id,
  }, update, (err, data) => {
    if (err) {
      return res.status(400).json({
        statusCode: 400,
        message: 'failed update tweet',
      });
    }

    return res.status(201).json({
      statusCode: 201,
      message: 'tweet has been updated',
    });
  });
};

/**
 * GET /api/user/followers
 */
// exports.getUserFollowers = (req, res, next) => {
//   const T = new Twit({
//     consumer_key: process.env.TWITTER_KEY,
//     consumer_secret: process.env.TWITTER_SECRET,
//     access_token: req.user.tokens.accessToken,
//     access_token_secret: req.user.tokens.tokenSecret,
//   });
//
//   let cursor;
//   let index = 0;
//   const getTwit = new CronJob({
//     cronTime: '*/15 * * * * *',
//     onTick: () => {
//       if (cursor !== 0 && cursor !== null) {
//         T.get('/followers/list', {
//             count: 200,
//             screen_name: req.user.username,
//             cursor: cursor,
//           },
//           (err, twitter, response) => {
//
//             // res.json(twitter);
//
//             UserFollowers.find({
//               userId: req.user.twitter,
//             }, (err, data) => {
//               console.log(err);
//               console.log(data.length);
//
//               if (data.length === 0 && !data.statusDone) {
//
//                 let followers = new UserFollowers({
//                   userId: req.user.twitter,
//                   username: req.user.username,
//                   followers: [twitter.users],
//                   statusDone: false,
//                 });
//
//                 followers.save((err, data) => {
//                   console.log({
//                     status: 'insert',
//                     data: data,
//                   });
//                 });
//               } else {
//                 UserFollowers.findOneAndUpdate({
//                   userId: req.user.twitter,
//                 }, {
//                   $push: {
//                     followers: twitter.users,
//                   },
//                 }, (err, data) => {
//                   console.log({
//                     status: 'update',
//                     data: data,
//                   });
//                 });
//               }
//             });
//
//             index += 1;
//             console.log(cursor);
//             console.log(index);
//             cursor = twitter.next_cursor;
//           });
//       } else {
//         UserFollowers.findOneAndUpdate({
//           userId: req.user.twitter,
//         }, {
//           $set: {
//             statusDone: true,
//           },
//         }, (err, data) => {
//           console.log({
//             statusDone: true,
//             data: data,
//           });
//         });
//         getTwit.stop();
//         console.log('Stopped');
//       }
//     },
//
//     start: false,
//     timeZone: 'Asia/Jakarta',
//   });
//
//   getTwit.start();
//
// };

/**
 * GET /api/user
 */
exports.getUserProfile = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
  });

  T.get('/users/show', {
    user_id: req.body.twitter_id,
  }, (err, data, response) => {
    if (err) {
      throw err;
    }

    res.json({
      statusCode: 200,
      message: 'Succes',
      data,
    });
  });
};

/**
 * GET /api/user/followers/list
 */
exports.getAllUserFollowersIds = (req, res, next) => {
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

  // UserFollowers.findOneAndRemove({
  //   username: req.user.username,
  // }, (err) => {
  //   console.log(err);
  // });

  T.get('followers/ids', params, (err, followers, response) => {
    if (err) next(err);

    //const ids = followers.ids.map(id => id.toString());

    res.json(followers);


  });
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
 * POST /api/twitter/search?q=?
 */
exports.searchTweets = (req, res, next) => {
  let params = {
    q: req.query.q,
    count: 100,
    lang: 'id',
    result_type: 'mixed',
  };

    const T = new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: req.body.access_token,
      access_token_secret: req.body.token_secret,
    });

  if (req.query.type === 'tweets') {
    T.get('search/tweets', params, (err, tweets, response) => {
      if (err) next(err);

      res.status(200).json(tweets);
    });
  }

  if (req.query.type === 'user') {
    T.get('users/search', params, (err, users, response) => {
      if (err) next(err);

      if (users.length === 0) {
        return res.status(200).json({
          statusCode: 204,
          message: `user ${req.query.q} not found  :(`,
        });
      }

      res.status(200).json({
        statusCode: 200,
        message: `success get user ${params.q}`,
        data: users,
      });
    });
  }
};

exports.searchGeo = (req, res, next) => {
  const today = new Date();
  let params = {
    geocode: `${req.body.lat},${req.body.long},10km`,
    q: '',
    result_type: 'recent',
    count: 100,
  };

  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
  });

  T.get('search/tweets', params, (err, tweets, resopnse) => {
    if (err) next(err);

    if (tweets.length === 0) {
      return res.status(200).json({
        statusCode: 204,
        message: 'user not found  :(',
      });
    }
    let users = [];
    tweets.statuses.map(tweet => {
      users.push(tweet.user);
    });

      res.status(200).json({
        statusCode: 200,
        message: 'success get user on area',
        data: _.uniqWith(users, _.isEqual),
      });

  });
};

/**
 * POST /api/twitter/follows/:id
 */
exports.followUser = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
  });

  const userId = {
    user_id: req.params.id,
    follow: true,
  };

  T.post('friendships/create', userId, (err, data, response) => {
    res.status(201).json({
      statusCode: 201,
      message: `you follow <strong> ${data.screen_name} </strong>`,
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
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
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

/**
 * GET /api/twitter/trainingset
 */
exports.getAllTrainingSet = function(req, res, next) {
  TrainingSet.find({}, (err, data) => {
    if (err) next(err);

    res.json({
      statusCode: 200,
      message: 'success get all data trainig tweets',
      data,
    });
  });
};

/**
 * DELETE /api/twitter/trainingset/:id
 */
exports.deleteTrainingsetById = (req, res, next) => {
  const id = req.params.id;
  TrainingSet.findByIdAndRemove(id, (err, data) => {
    if (err) next(err);

    res.status(204).json({
      statusCode: 204,
      message: 'Training tweets has been deleted',
    });
  });
};

/**
 * POST /api/twitter/trainingset
 */
exports.addTrainingSetTweets = (req, res, next) => {
  const TestingSet = require('../models/Testing');

  const trainingData = {
    tweet: req.body.tweet,
    categoryName: req.body.category,
  };

  const newTrainingSet = new TestingSet(trainingData);
  newTrainingSet.save((err) => {
    if (err) next(err);

    res.status(201).json({
      statusCode: 201,
      message: `Tweet added to category ${trainingData.categoryName}`,
    });
  });
};

/**
 * POST /api/twitter/trainingset/timeline
 */
exports.addTrainingSetTimeline = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });

  let params = {
    user_id: Number(req.body.user_id),
    count: 200,
  };
  let category = req.body.category;

  T.get('statuses/user_timeline', params, (err, timeline, response) => {
    timeline.map(t => {
      let trainingData = new TrainingSet({
        tweet: t.text,
        categoryName: category,
      });

      trainingData.save(err => {
        if (err) next(err);
      });
    });

    res.status(201).json({
      statusCode: 201,
      message: `User ${timeline[0].user.name} has been added to ${category}`,
    });
  });
};

/**
 * POST /user/followers/timeline/add
 * SAMPEL DATA USER FOR SIDANG
 */
exports.addUserTimeline = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });

  let params = {
    user_id: Number(req.body.user_id),
    count: 200,
  };

  let category = req.body.category;

  T.get('statuses/user_timeline', params, (err, timeline, response) => {
    async.waterfall([
      (callback) => {
        let tweets = [];

        timeline.map(tl => {
          tweets.push({
            text: tl.text,
            time: new Date(tl.created_at),
            lang: tl.lang,
            category: '',
          });
        });

        callback(null, tweets);
      },

      (tweets, callback) => {
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
            category,
          },
          tweets,
        };

        callback(null, data);
      },
      (data, callback) => {
        let newData = new UserFollowerTimeline(data);

        newData.save((err) => {
          if (err) next(err);

          res.status(201).json({
            statusCode: 201,
            message: 'success add timeline',
          });
        });
      },
    ]);
  });
};

/**
 * GET /user/followers/category
 * GET USER FOLLOWER BY CATEGORY FOR BLAST TWEET
 */


/**
 * GET /user/besttime
 * GET BEST TIME TO TWEET TIMES
 */
exports.bestTimeToTweet = (req, res, next) => {
  const params = {
    username : req.body.username
  };
  UserFollowerTimeline.find(params, (err, followers) => {
    async.waterfall([
      changeToHours,
      setBestTime,
      (bestTime, callback) => {
        res.status(200).json({
          statusCode: 200,
          message: 'succes get best time to tweet',
          data: bestTime,
        });
      },
    ]);

    function setBestTime(hours, callback) {
      let bestTime = {
        t0to9: 0,
        t9to12: 0,
        t12to15: 0,
        t15to18: 0,
        t18to21: 0,
        t21to24: 0,
      };

      hours.map(hour => {
        if ((hour < 9) && (hour >= 0)) bestTime.t0to9 += 1;
        if ((hour < 12) && (hour >= 9)) bestTime.t9to12 += 1;
        if ((hour < 15) && (hour >= 12)) bestTime.t12to15 += 1;
        if ((hour < 18) && (hour >= 15)) bestTime.t15to18 += 1;
        if ((hour < 21) && (hour >= 18)) bestTime.t18to21 += 1;
        if ((hour <= 24) && (hour >= 21)) bestTime.t21to24 += 1;
      });

      callback(null, bestTime);
    }

    function changeToHours(callback) {
      let tweetTime = [];
      var i = 0;
      followers.map((follower) => {
        follower.tweets.map(tweet => {
          if(i<=2000){
            tweetTime.push(tweet.time.getHours());
          }
          i++;
        });
      });

      callback(null, tweetTime);
    }
  });
};

/* User Classification*/
exports.followerClassification = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.access_token,
    access_token_secret: req.body.token_secret,
  });
  const param = {
      userId : req.body._id,
      "userDetail.userId" : req.body.user_id
  };
  UserFollowerTimeline.find(param,function(err,datas){
      if(datas.length === 0){
          let params = {
              user_id: Number(req.body.user_id),
              count: 200,
            };

            T.get('statuses/user_timeline', params, (err, timeline, response) => {
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
                                          }else if(category['Scored Labels'] === 'Fashion'){
                                              fashion++;
                                          }else if(category['Scored Labels'] === 'Sports'){
                                              sports++;
                                          }else if(category['Scored Labels'] === 'Travel'){
                                              travel++;
                                          }
                                      });
                                      console.log(foods);
                                      console.log(travel);
                                      console.log(fashion);
                                      console.log(sports);

                                      if((foods >= health) && (foods >= travel) && (foods >= fashion) && (foods >= sports)){
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
                                          userId: req.body._id,
                                          username: req.body.username,
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
