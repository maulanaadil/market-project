const Twit = require('twit');
const _ = require('lodash');
const moment = require('moment');
const async = require('async');
const request = require('request');
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',

  httpAdapter: 'https',
  apiKey: 'AIzaSyAyxvYX6-S92B9CVFFIBsPJaOmDky8tXvM',
  formatter: null
};

var geocoder = NodeGeocoder(options);

function classify(post,callback) {
  const posting =  JSON.stringify(
    {
      "Inputs": {
        "input1": post
      },
      "GlobalParameters": {}
    }
  );

  request({
      url: 'https://asiasoutheast.services.azureml.net/subscriptions/7a38336d77ae429085b6d8af7c3b5eeb/services/cb93407f21d84ecea1e837f3a5ee72ce/execute?api-version=2.0&format=swagger', //URL to hit
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer 5R1krCG6+TvPBvh75/9KrTkfLpDTfy7jS7V8hVPmlEs2LNVUK8N511Ppu34+v48iPsghPLzQCP4gSCwuU+lOjQ=='
    },
      body:posting
    }, function(error, response, body){
        if(error) {
          console.log('error gan di request');
          console.log(error);
        }
        let bodies = JSON.parse(body);
        let cats = bodies.Results.output1;
        cats.forEach(function(category){
            callback(null, category['Scored Labels']);
        });
    });
}

exports.tes = (req, res, next) => {
  const today = new Date();
  var lokasi = '';
  let params = {
    geocode: `${req.body.lat},${req.body.long},10km`,
    // geocode: '25.0175862,121.2261842,1000mi',
    q: '',
    result_type: 'recent',
    count: 100,
  };
    geocoder.reverse({lat:req.body.lat, lon:req.body.long}, function(err, data) {
      if(err)
        console.log(err);

      lokasi = data[0].administrativeLevels.level3short+', '+data[0].administrativeLevels.level2short;
    });

  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.body.accessToken,
    access_token_secret: req.body.tokenSecret,
    // access_token: '238039202-IzmGvnvrrqWI8rzjSbj41bRdZzIuJJMeTb7egJop',
    // access_token_secret: 'oJDMSLWvUQQBKwpkXmLNNK12Cod1fCdXybJeDoubXZgPC',
  });

  T.get('search/tweets', params, (err, tweets, resopnse) => {
    if (err) console.log(err);

    if (tweets.length === 0) {
      return res.status(200).json({
        statusCode: 204,
        message: 'user not found  :(',
      });
    }
    var dataTweet = [];
    // async.waterfall([
    //   (done) => {
        var users = [];
        // tweets.statuses.map(tweet => {
        async.forEachOf(tweets.statuses, function (tweets, i, callback) {
        // for (var i = 0; i < tweets.statuses.length-1; i++) {
          // if(tweets.statuses[i].place != null){
            var post = [{
              tweet : tweets.text,
              categoryName : ''
            }];
            // (function(i) {
              // console.log(tweets);
              _.find(users, { 'user.screen_name': tweets.user.screen_name}, (err, result)=>{
                console.log("coeg")
                console.log(err);
                console.log(result);

              });
            classify(post, (err,data) => {
              var img = '';
              if(tweets.place != null){
                console.log('ada geo-nya gan')
                if(data == 'Fashion') {
                  img = '/images/nearby/ic-nearby-fashion-twitter.png';
                }else if(data == 'Sports') {
                  img = '/images/nearby/ic-nearby-sport-twitter.png';
                }else if(data == 'Foods') {
                  img = '/images/nearby/ic-nearby-food-twitter.png'
                }else{
                  img = '/images/nearby/ic-nearby-travel-twitter.png';
                }
                users.push({"classify":img,"classifyText":data,"status":tweets.text,"user":tweets.user,"place":tweets.place,"coordinate":tweets.coordinates});
              }
              callback();
              // if(tweet.length == 3)
              // if(i == tweets.statuses.length-2){
              //   return res.status(200).json({
              //     statusCode: 200,
              //     message: 'success get user on area',
              //     data: _.uniqWith(users, _.isEqual),
              //   });
              // }
            });
            // })(i);
            // console.log(tweet);
          // }
        }, () => {
          // console.log(users);
          return res.status(200).json({
            statusCode: 200,
            message: 'success get user on area',
            lokasi: lokasi,
            data: _.uniqWith(users, _.isEqual),
          });
        });
        // });
    //   }
    // ], (err,data) => {

    // });

  });
};
