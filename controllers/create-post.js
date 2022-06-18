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
 * create post api/create-post buat pada fitur organic post schedule, atau kirim sekarang
 */
exports.createPost = (req, res, next)=>{
  console.log(req.body)
    var storage = multer.diskStorage({
        filename : function(req,file,callback){
          callback(null,req.user._id+'-'+file.originalname);
        }
    });
var upload = multer({storage:storage}).single('image');
upload(req,res,function(err){
        console.log(req.body)
      if(err)
        console.log(err);
            async.waterfall([
                function(callback){
                    if(req.file){
                        if(req.body.schedule === 'true' && req.body.blast === 'false'){
                            /**
                             * Set Schedule with image
                             */
                            var b64content = fs.readFileSync(req.file.path, { encoding: 'base64' });
                            const schedule = {
                                        token: req.user.tokens,
                                        tweet: req.body.post,
                                        userId: req.user._id,
                                        lat: req.body.lat,
                                        long: req.body.long,
                                        image : b64content,
                                        time: new Date(req.body.date),
                                        countDown: '',
                                        facebookToken : req.user.facebookToken,
                                        blast : req.body.blast
                            };
                            const newSchedule = new ScheduleTweet(schedule);

                            newSchedule.save((err, data) => {
                                callback(null, 'done')
                            });
                        }else if(req.body.schedule === 'true' && req.body.blast === 'true'){
                            /**
                             * Set Schedule Blast Post with image
                             */
                            var b64content = fs.readFileSync(req.file.path, { encoding: 'base64' });
                            const schedule = {
                                        token: req.user.tokens,
                                        tweet: req.body.post,
                                        userId: req.user._id,
                                        lat: req.body.lat,
                                        long: req.body.long,
                                        image : b64content,
                                        time: new Date(req.body.date),
                                        countDown: '',
                                        facebookToken : req.user.facebookToken,
                                        blast : req.body.blast,
                                        category : req.body.category
                            };
                            const newSchedule = new ScheduleTweet(schedule);

                            newSchedule.save((err, data) => {
                                if(err)
                                    console.log(err);

                                callback(null, 'done')
                            });
                        }else if(req.body.schedule === 'false' && req.body.blast === 'true'){
                            /**
                             * Send Blast Post with image now
                             */
                            const T = new Twit({
                                consumer_key: process.env.TWITTER_KEY,
                                consumer_secret: process.env.TWITTER_SECRET,
                                access_token: req.user.tokens.accessToken,
                                access_token_secret: req.user.tokens.tokenSecret
                            });
                            async.waterfall([
                                postTweet,

                            ],(err, results) => {
                                callback(null, 'done')
                            });

                            function postTweet(callback) {
                                    const query = {
                                    userId: req.user._id,
                                    username: req.user.username,
                                    'userDetail.category': req.body.category,
                                    };
                                    console.log(query);
                                    UserFollowerTimeline.find(query, {
                                    userDetail: 1}, (err, data) => {
                                        data.map(flwr =>{

                                            tweet = req.body.post;
                                            tweets = tweet.replace(/\${mention}/g, '@' + flwr.userDetail.screenName);
                                            console.log(tweets);
                                            let data = {
                                                    status: tweets,
                                            };

                                            var b64content = fs.readFileSync(req.file.path, { encoding: 'base64' });
                                            T.post('media/upload', { media_data: b64content }, function (err, data, response) {

                                                var mediaIdStr = data.media_id_string
                                                var meta_params = { media_id: mediaIdStr, alt_text: { text: tweets } }

                                                T.post('media/metadata/create', meta_params, function (err, data, response) {
                                                if (!err) {
                                                    var params = { status: tweets, media_ids: [mediaIdStr] }

                                                    T.post('statuses/update', params, function (err, data, response) {
                                                    //   console.log(data)
                                                    })
                                                }
                                                });
                                                if (response.statusCode === 200) {
                                                    callback(null, 'done')
                                                } else {
                                                callback(null, 'failed')
                                                }
                                            });

                                        });
                                    });
                                    callback(null);
                                    }
                        }else{
                            /**
                             * Sned Blast Post with image now
                             */
                            const T = new Twit({
                                consumer_key: process.env.TWITTER_KEY,
                                consumer_secret: process.env.TWITTER_SECRET,
                                access_token: req.user.tokens.accessToken,
                                access_token_secret: req.user.tokens.tokenSecret,
                            });
                            var b64content = fs.readFileSync(req.file.path, { encoding: 'base64' });
                            T.post('media/upload', { media_data: b64content }, function (err, data, response) {

                                var mediaIdStr = data.media_id_string
                                var altText = req.body.post;
                                var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

                                T.post('media/metadata/create', meta_params, function (err, data, response) {
                                if (!err) {
                                    var params = { status: req.body.post, media_ids: [mediaIdStr] }

                                    T.post('statuses/update', params, function (err, data, response) {
                                    console.log(data)
                                    })
                                }
                                });
                                if (response.statusCode === 200) {
                                callback(null, 'done')
                                } else {
                                callback(null, 'failed')
                                }
                            });
                        }
                    }else{
                        if(req.body.schedule === 'true' && req.body.blast === 'false'){
                            /**
                             * Set Schedule post tanpa gambar 
                             */
                            var b64content = fs.readFileSync(req.file.path, { encoding: 'base64' });
                            const schedule = {
                                        token: req.user.tokens,
                                        tweet: req.body.post,
                                        userId: req.user._id,
                                        lat: req.body.lat,
                                        long: req.body.long,
                                        image : b64content,
                                        time: new Date(req.body.date),
                                        countDown: '',
                                        facebookToken : req.user.facebookToken,
                                        blast : req.body.blast
                            };
                            const newSchedule = new ScheduleTweet(schedule);

                            newSchedule.save((err, data) => {
                                callback(null, 'done')
                            });
                        }else if(req.body.schedule === 'true' && req.body.blast === 'true'){
                            /**
                             * Set Schedule Blast Post without image
                             */
                            const schedule = {
                                        token: req.user.tokens,
                                        tweet: req.body.post,
                                        userId: req.user._id,
                                        lat: req.body.lat,
                                        long: req.body.long,
                                        time: new Date(req.body.date),
                                        countDown: '',
                                        facebookToken : req.user.facebookToken,
                                        blast : req.body.blast,
                                        category : req.body.category
                            };
                            const newSchedule = new ScheduleTweet(schedule);

                            newSchedule.save((err, data) => {
                                callback(null, 'done')
                            });
                        }else if(req.body.schedule === 'false' && req.body.blast === 'true'){
                            /**
                             * Send Blast Post without image now
                             */
                            const T = new Twit({
                                consumer_key: process.env.TWITTER_KEY,
                                consumer_secret: process.env.TWITTER_SECRET,
                                access_token: req.user.tokens.accessToken,
                                access_token_secret: req.user.tokens.tokenSecret
                            });
                            async.waterfall([
                                postTweet,

                            ],(err, response) => {
                                callback(null, 'done')
                            });

                            function postTweet(callback) {
                                    const query = {
                                    userId: req.user._id,
                                    username: req.user.username,
                                    'userDetail.category': req.body.category,
                                    };
                                    console.log(query);
                                    UserFollowerTimeline.find(query, {
                                    userDetail: 1}, (err, data) => {
                                        data.map(flwr =>{

                                            tweet = req.body.post;
                                            tweets = tweet.replace(/\${mention}/g, '@' + flwr.userDetail.screenName);
                                            console.log(tweets);
                                            let data = {
                                                    status: tweets,
                                            };

                                            T.post('/statuses/update', data, (err, twtter, response) => {
                                                if (response.statusCode === 200) {
                                                callback(null, 'done')
                                                } else {
                                                callback(null, 'failed')
                                                }
                                            });

                                        });
                                    });
                                    callback(null);
                                    }
                        }else{
                            /**
                             * Send Post now ke twitter
                             */
                            const T = new Twit({
                                consumer_key: process.env.TWITTER_KEY,
                                consumer_secret: process.env.TWITTER_SECRET,
                                access_token: req.user.tokens.accessToken,
                                access_token_secret: req.user.tokens.tokenSecret,
                            });
                            T.post('statuses/update', {status : req.body.post}, function (err, data, response) {
                                callback(null, 'done')
                            })
                        }
                    }
                }
            ], function(err, results){
                if(results === 'done'){
                    res.status(201).json({
                        statusCode: 201,
                        message: 'Post berhasil disimpan',
                });
                }else{
                    res.status(400).json({
                        statusCode: 401,
                        message: 'Failed send post',
                });
                }

            })

    });
}
