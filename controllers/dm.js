const Twit = require('twit');
const _ = require('lodash');
const CronJob = require('cron').CronJob;
const moment = require('moment');
const async = require('async');
const request = require('request');

exports.getDM = (req, res, next)=>{
    const T = new Twit({
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        access_token: req.user.tokens.accessToken,
        access_token_secret: req.user.tokens.tokenSecret,
    });

    T.get('/direct_messages', {}, (err, twitter, response)=>{
        if (response.statusCode === 200) {
            res.status(200).json({
              statusCode: response.statusCode,
              message: 'Success get dm',
              data:twitter,
            });
          } else {
            res.json({
              statusCode: 500,
              message: 'Cek kembali tweet anda',
              err,
            });
          }
    });
}
exports.getDMId = (req, res, next)=>{
    const T = new Twit({
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        access_token: req.user.tokens.accessToken,
        access_token_secret: req.user.tokens.tokenSecret,
    });

    T.get('/direct_messages/show', {id : req.params.id}, (err, twitter, response)=>{
        if (response.statusCode === 200) {
            res.status(200).json({
              statusCode: response.statusCode,
              message: 'Success get dm',
              data:twitter,
            });
          } else {
            res.json({
              statusCode: 500,
              message: 'Cek kembali tweet anda',
              err,
            });
          }
    });
}
exports.sendDM = (req, res, next)=>{
    const T = new Twit({
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        access_token: req.user.tokens.accessToken,
        access_token_secret: req.user.tokens.tokenSecret,
    });
    console.log(req.body);
    T.post('/direct_messages/new', {user_id : req.body.user_id, text : req.body.message}, (err, twitter, response)=>{
        if (response.statusCode === 200) {
            res.status(200).json({
              statusCode: response.statusCode,
              message: 'Success send message',
              data:twitter,
            });
          } else {
            res.json({
              statusCode: 500,
              message: 'Cek kembali pesan anda anda',
              err,
            });
          }
    });
}