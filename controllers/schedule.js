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
const fs = require('fs');
const multer = require('multer');
/**
 * GET /api/user/post/schedule buat ngambil data schedule post pengguna
 */
exports.getScheduleTweets = (req, res, next) => {
  ScheduleTweet.find({
    userId: req.user._id,
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
 * DELETE /api/user/post/schedule/:id buat ngedelete schedule post pengguna
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
 * POST /api/user/post/schedule buat ngirim schedule tweet yang tanpa gambar
 */
exports.newScheduleTweet = (req, res, next) => {
  const schedule = {
    token: req.user.tokens,
    tweet: req.body.tweet,
    userId: req.user._id,
    lat: req.body.lat,
    long: req.body.long,
    time: new Date(req.body.date),
    countDown: '',
    facebookToken : req.user.facebookToken
  };
  const newSchedule = new ScheduleTweet(schedule);

  newSchedule.save((err, data) => {
    res.status(201).json({
      data,
      statusCode: 201,
      message: 'Tweet berhasil disimpan',
    });
  });
};

  /**
   *Buat nyimpan schedule post yang pakai gambar
   */
  exports.scheduleWithImage = (req,res,next)=> {
  //pindah gambar ke lokal dulu di folder public/images/schedule
  var storage = multer.diskStorage({
          destination : function(req,file,callback){
            callback(null,'public/images/schedule');
          },
          filename : function(req,file,callback){
            callback(null,req.user._id+'-'+file.originalname);
          }
      });
  var upload = multer({storage:storage}).single('file');
  upload(req,res,function(err){

        if(err)
          console.log(err);

          const T = new Twit({
            consumer_key: process.env.TWITTER_KEY,
            consumer_secret: process.env.TWITTER_SECRET,
            access_token: req.user.tokens.accessToken,
            access_token_secret: req.user.tokens.tokenSecret,
          });
          //gambar dijadiin base64 karena format api dari twitter harus base64
          var b64content = fs.readFileSync(req.file.path, { encoding: 'base64' });
          const schedule = {
                      token: req.user.tokens,
                      tweet: req.body.tweet,
                      userId: req.user._id,
                      lat: req.body.lat,
                      long: req.body.long,
                      image : b64content,
                      time: new Date(req.body.date),
                      countDown: '',
                      facebookToken : req.user.facebookToken,
                      img_name : req.file.filename
                };
           const newSchedule = new ScheduleTweet(schedule);
          //simopan ke datavbase
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
