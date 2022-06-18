const Twit = require('twit');
const _ = require('lodash');
const CronJob = require('cron').CronJob;
const moment = require('moment');
const async = require('async');
const request = require('request');
const FB = require('fb');

const UserFollowers = require('../models/UserFollower');
const ScheduleTweet = require('../models/Schedule');
const TrainingSet = require('../models/Testing');
const UserFollowerTimeline = require('../models/UserFollowerTimeline');
const Post = require('../models/post');
const fs = require('fs');
const multer = require('multer');

/**
 * getTimeline digunakan untuk mengambil feed profile dari pengguna
 */

exports.getTimeline = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });
  var params = {
    screen_name: req.user.username,
    count: 5,
  };
  T.get('statuses/user_timeline', params, (err, data, response) => {
    if (err) console.log(err);

    res.json({
      status_code: 200,
      message: 'Success get feed timeline',
      data: data,
    });
  });
};

/**
 * getTweetById digunakan untuk mengambil tweet berdasarkan id tweet
 */
exports.getTweetById = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });
  var params = {
    id: req.query.id,
  };
  T.get('statuses/show', params, (err, data, response) => {
    if (err) console.log(err);

    res.json({
      status_code: 200,
      message: 'Success get feed timeline',
      data: data,
    });
  });
};

/**
 * getTrends digunakan untuk mengambil trends terbaru saat ini dari twitter
 */
exports.getTrends = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });
  T.get('trends/place', { id: '23424846' }, (err, data, response) => {
    if (err) console.log(err);

    res.json({
      status_code: 200,
      message: 'Success get trends',
      data: data,
    });
  });
};
/**
 * postTweet digunakan untuk melakukan tweet
 */
exports.postTweet = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });
  async.waterfall(
    [
      //save tweet to databases
      function (callback) {
        const data = {
          userId: req.user.twitter,
          name: req.user.name,
          img_profile: req.user.picture,
          tweet: req.body.tweet,
        };
        const create = new Post(data);
        create.save({}, (err) => {
          if (err) console.log(err);

          console.log('saved');
          callback(null, 'done');
        });
      },
    ],
    function (err, result) {
      //send tweet to media social twitter
      if (result === 'done') {
        async.parallel(
          {
            twitter: function (callback) {
              T.post(
                '/statuses/update',
                {
                  status: req.body.tweet,
                  lat: req.body.lat,
                  long: req.body.long,
                },
                (err, twitter, response) => {
                  if (err) {
                    console.log(err);
                    callback(null, false);
                  }

                  console.log('send twitter success');
                  callback(null, true);
                }
              );
            },
          },
          function (err, results) {
            console.log(results);
            if (results.twitter === true || results.facebook === true) {
              res.status(201).json({
                statusCode: 201,
                message: 'Post berhasil di dikirim',
                tweet: req.body.tweet,
              });
            } else {
              res.json({
                statusCode: 500,
                message: 'Cek kembali tweet anda',
                err,
              });
            }
          }
        );
      }
    }
  );
};

/**
 * mention digunakan untuk mengambil data mention dari twitter
 */
exports.mention = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });
  T.get('statuses/mentions_timeline', { count: 30 }, (err, data, response) => {
    let mention = {
      status_code: 200,
      messages: 'Success get mentions',
      data: data,
    };
    res.json(mention);
  });
};

/**
 * postImage digunakan untuk melakukan tweet beserta dengan gambar
 */
exports.postImage = (req, res, next) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/post');
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    },
  });
  var upload = multer({ storage: storage }).single('file');
  upload(req, res, function (err) {
    if (err) console.log(err);
    async.waterfall(
      [
        function (callback) {
          const data = {
            userId: req.user.twitter,
            tweet: req.body.tweet,
            name: req.user.name,
            img_profile: req.user.picture,
            image: req.file.filename,
          };
          const create = new Post(data);
          create.save({}, (err) => {
            if (err) console.log(err);

            console.log('saved');
            callback(null, 'done');
          });
        },
      ],
      function (err, result) {
        console.log('result ' + result);
        if (result === 'done') {
          const T = new Twit({
            consumer_key: process.env.TWITTER_KEY,
            consumer_secret: process.env.TWITTER_SECRET,
            access_token: req.user.tokens.accessToken,
            access_token_secret: req.user.tokens.tokenSecret,
          });
          var b64content = fs.readFileSync(req.file.path, {
            encoding: 'base64',
          });
          T.post(
            'media/upload',
            { media_data: b64content },
            function (err, data, response) {
              var mediaIdStr = data.media_id_string;
              var altText = req.body.tweet;
              var meta_params = {
                media_id: mediaIdStr,
                alt_text: { text: altText },
              };

              T.post(
                'media/metadata/create',
                meta_params,
                function (err, data, response) {
                  if (!err) {
                    var params = {
                      status: req.body.tweet,
                      media_ids: [mediaIdStr],
                    };

                    T.post(
                      'statuses/update',
                      params,
                      function (err, data, response) {
                        console.log(data);
                      }
                    );
                  }
                }
              );
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
            }
          );
        }
      }
    );
  });
};

/**
 * POST /api/create-post untuk melakukan blast post / organic post market ke twitter
 */
exports.blastTweet = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });

  //data dalam bentuk array
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

  //fungsi untuk mengirim mention ke follower yang telah di kategorikan *data berasal dari frontend
  function postTweet(callback) {
    var i = 0;
    listTweet.map((tweet) => {
      if (i <= 100) {
        let data = {
          status: tweet.tweet,
        };
        T.post('/statuses/update', data, (err, twtter, response) => {
          if (response.statusCode === 200) {
            console.log({
              statusCode: response.statusCode,
              message: 'Tweet has been posted',
              tweet: req.body.tweet,
            });
          } else {
            return res.json({
              statusCode: 500,
              message: 'Cek kembali tweet anda',
              err,
            });
          }
        });
      }
      i++;
    });
    callback(null);
  }
};

/**
 * getUserProfile digunakan untuk mengambil profile user yang sedang login
 */

exports.getUserProfile = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });

  T.get(
    '/users/show',
    {
      user_id: req.user.twitter,
    },
    (err, data, response) => {
      if (err) {
        throw err;
      }

      res.json({
        statusCode: 200,
        message: 'Succes',
        data,
      });
    }
  );
};

/**
 * GET /api/user/followers/list digunkan untuk mengambil ID user dari follower pengguna maksimal 5000
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

  T.get('followers/ids', params, (err, followers, response) => {
    if (err) next(err);

    const ids = followers.ids.map((id) => id.toString());

    const userId = {
      userId: req.user._id,
    };

    // ADD DATA IF NO DATA FONUD
    UserFollowers.findOne(userId, (err, data) => {
      if (data) {
        if (data.length < 1) {
          const newUserFollowers = new UserFollowers({
            userId: req.user._id,
            username: req.user.username,
            followers: ids,
            statusDone: false,
            pointer: -1,
          });

          newUserFollowers.save((err, userFollowers) => {
            if (err) next(err);
            console.log('Success add followerIds');
            res.status(200).json({
              statusCode: 200,
              message: 'succes get all followers id',
              followerIds: userFollowers,
            });
          });
        }
      }
    });

    next();
  });
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
  var accessToken = '';
  var accessTokenSecret = '';
  if (req.user.role !== 'admin') {
    accessToken = req.user.tokens.accessToken;
    accessTokenSecret = req.user.tokens.tokenSecret;
  } else {
    accessToken = '814707104-5UQg42UvYc8SNHVy5oAt84xblhAgh1DAbl8uqYt4';
    accessTokenSecret = 'Aubk6Xg8amnowjXa1cx8x4NkjyV0yWAjXLvSiAKne3GrF';
  }
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
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
