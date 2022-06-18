const async = require('async');
const Twit = require('twit');
const CronJob = require('cron').CronJob;

const PreprocessingController = require('../preprocessing');

const UserFollowerTimeline = require('../../models/UserFollowerTimeline');
const UserFollowers = require('../../models/UserFollower');
const TwitterPrepros = require('../../models/PreprocessingResultTwitter');

exports.getCategoryFollowers = (req, res, next) => {
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
exports.getAllFollowersUser = (req, res, next) => {
  const user = {
    screen_name: req.params.screen_name,
  };

    let T = new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: req.body.access_token,
      access_token_secret: req.body.token_secret,
    });

     T.get('followers/list', user,  function (err, data, response) {
              if (data.length === 0) {
                return res.status(200).json({
                  statusCode: 204,
                  message: 'user not found',
                });
              }

          res.status(200).json({
            statusCode: 200,
            message: 'success get followers',
            data: data,
          });
    });
};
exports.getFollowerCategory = (req, res, next) => {
  const user = {
    userId: req.body._id,
    username: req.body.username,
  };

  UserFollowerTimeline.find(user, {
    userDetail: 1,
  }, (err, followers) => {
    res.status(200).json({
      statusCode: 200,
      message: 'success get all follower category',
      followers,
    });
  });
};
exports.getUserFollowerCategory = (req, res, next) => {
  const query = {
    userId: req.body._id,
    username: req.body.username,
    'userDetail.category': req.params.category,
  };

  UserFollowerTimeline.find(query, {
    userDetail: 1
  }, (err, data) => {
    res.status(200).json({
      statusCode: 200,
      message: `success get followers with category ${req.params.category}`,
      followers: data,
    });
  });
};
/**
 * GET USER FOLLOWERS TIMELINE
 * /api/user/followers/timeline
 */
exports.getUserFollowersTimeline = (req, res, next) => {
  console.log('GET USER TIMELINE');

    let T = new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: req.body.access_token,
      access_token_secret: req.body.token_secret,
    });

    let userId = {
      userId: req.params.id,
    };
  

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
