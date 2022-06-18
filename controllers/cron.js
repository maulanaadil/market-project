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
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');

// CronJob for ScheduleTweets {background process jalan tiap detik}
const scheduleTweets = new CronJob({
  cronTime: '0 * * * * *',
  onTick() {
    console.log("check schedule tweet..")

    //cek ada yang tanggal dan jam sama atau kagak
    ScheduleTweet.find({}, function(err, data) {
      const today = new Date();
      if (data.length > 0) {
        data.forEach(function(item) {
          if (moment(today).isAfter(item.time)) {
            const T = new Twit({
              consumer_key: process.env.TWITTER_KEY,
              consumer_secret: process.env.TWITTER_SECRET,
              access_token: item.token.accessToken,
              access_token_secret: item.token.tokenSecret,
            });
          //kalo ada di cek gambar dulu apakah schedule mengandung media gambar
          if(item.image){
            async.parallel({
              twitter : function(callback){
                //cek kalo status post blast maka langsung di blast mention ke pengguna
                if(item.blast === true){
                    async.waterfall([
                        postTweet,

                    ],(err, result) => {
                        callback(null, 'done')
                    });

                    function postTweet(callback) {
                            const query = {
                            userId: item.userId,
                            'userDetail.category': item.category,
                            };
                            console.log(query);

                            //get follower pengguna berdasarkan kategori dari database
                            UserFollowerTimeline.find(query, {
                            userDetail: 1}, (err, data) => {
                                data.map(flwr =>{

                                    tweet = item.tweet;
                                    //ngereplace ${mention} dengan username follower *biar bisa mention otomatis
                                    tweets = tweet.replace(/\${mention}/g, '@' + flwr.userDetail.screenName);
                                    console.log(tweets);
                                    let data = {
                                            status: tweets,
                                    };

                                    //kirim post ke twittter
                                    T.post('media/upload', { media_data: item.image }, function (err, data, response) {

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
                                        // console.log(response);
                                    });

                                });
                            });
                            callback(null);
                          }


                          //hapus schedule post kalo udah berhasil ke kirim
                          ScheduleTweet.findByIdAndRemove(item._id, function(err, data) {
                            console.log(item._id + ' dihapus');
                          });
                }else{
                  //tweet kalo tanpa blast post jadi dikirim dalam bentuk tweet biasa tanpa mention
                  T.post('media/upload', { media_data: item.image }, function (err, data, response) {
                    var mediaIdStr = data.media_id_string
                    var altText = item.tweet;
                    var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

                    T.post('media/metadata/create', meta_params, function (err, data, response) {
                      if (!err) {
                        var params = { status: item.tweet, media_ids: [mediaIdStr] }

                        T.post('statuses/update', params, function (err, data, response) {
                          console.log(item.tweet+' Tweeted with image')
                        })
                      }
                    });

                  });
                  ScheduleTweet.findByIdAndRemove(item._id, function(err, data) {
                    console.log(item._id + ' dihapus');
                  });
                }

              }
            }, function(err, result){

              console.log('done');
            })

          }else{
              //kirim tweet/blast tweet tanpa gambar
              async.parallel({
                twitter : function(callback){
                  T.post('statuses/update', {
                    status: item.tweet,
                    lat: item.lat,
                    long: item.long,
                  }, function(err, data, response) {
                    console.log(item.tweet + ' Tweeted');
                  });
                }
              }, function(err, result){
                console.log('done');
              })

          }
            ScheduleTweet.findByIdAndRemove(item._id, function(err, data) {
              console.log(item._id + ' dihapus');
            });
          }
        });
      }
    });
  },

  start: true,
  timeZone: 'Asia/Jakarta',
});

//CronJob for Classification user, check user yang belum diklasifikasi sebelumnya atau yang status classified = false;
const classifiedFollower = new CronJob({
  cronTime: '0 * * * * *',
  onTick() {
    console.log('start classification ... ');
    //check user yang belum terklasifikasi
    User.find({classified : false},(err,data)=>{

      async.waterfall([
          (callback)=>{
              //kalo ada user maka dilakukan pengulangan sejumlah user
              data.map(user => {
                    //cek access token dll biar kagak error
              		  if((user.tokens.accessToken === '') || (user.tokens.accessToken === null) || (user.tokens.accessToken === 'undefined')){
              		  	callback(null, null);
              		  }
                      const T = new Twit({
                          consumer_key: process.env.TWITTER_KEY,
                          consumer_secret: process.env.TWITTER_SECRET,
                          access_token: user.tokens.accessToken,
                          access_token_secret: user.tokens.tokenSecret,
                       });
                      console.log(user.name);
                            let params = {
                              count: 500,
                              user_id: user.twitter,
                            };
                            //GET follower pengguna
                            T.get('followers/ids', params, (err, followers, response) => {
                                if (err) console.log(err);
                                console.log(followers);
                                async.waterfall([
                                      (callback)=>{
                                          const ids = followers.ids;
                                            ids.map(flwr => {

                                                if((flwr !== null) && (flwr !== undefined)){
                                                  //test classifi
                                                    let params = {
                                                        user_id: Number(flwr),
                                                        count: 200,
                                                      };
                                                      //GET tweet dari setiap follower pengguna
                                                      T.get('statuses/user_timeline', params, (err, timeline, response) => {

                                                        async.waterfall([
                                                          (callback) => {
                                                            let tweets = [];
                                                            let post = [];
                                                            if(timeline.length > 1){
                                                                timeline.map(tl => {
                                                                   //tweet dimasukkn ke dalam array, karena bentuk request harus batch array *gak tau batch? google it !
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
                                                           }else{
                                                              //console.log(timeline.error);
                                                           }
                                                          },
                                                          (tweets, post, callback) => {

                                                            //kalo tweet sudah masuk ke array semua, bakal dikirm ke azure ML buat di klasifikasi
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
                                                                                    console.log('error gan di request');
                                                                                }
                                                                                /**
                                                                                 * Hasil response Axure ML di itung berdasarkan jumlah terbanyak per masing - masing kategori tweet
                                                                                 * kategori tweet tertinggi bakal nentuin user itu kategorinya kayak gimana
                                                                                 */
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
                                                                                  //kalo udah deal fix kategorinya apa, hasil di save ke database
                                                                                  let data = {
                                                                                    userId: user._id,
                                                                                    username: user.username,
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

                                                            //save data hasil klasifikasi ke database
                                                            let newData = new UserFollowerTimeline(data);

                                                            newData.save((err, data) => {
                                                              if (err) console.log('err gan pas ngesave');

                                                              callback(null,data)
                                                            });
                                                          },
                                                        ]);
                                                      });
                                       //end classid
                                                }
                                            });
                                            const status = 'done';
                                            callback(null ,data);
                                      },(data,callback)=>{

                                          //update status user yang tadinya belum diklasifikasi jadi sudah diklasifikasi.
                                          if((data !== null)&&(data !== undefined)){
                                              User.findOneAndUpdate({twitter : user.twitter},{classified : true},function(err,data){
                                                if(err)
                                                    console.log(err);

                                                  console.log('user '+user.name+' classified');
                                              });
                                          }
                                      }
                                  ]);


                            });
              //end user
              });
              const done = true;
              callback(null, done)
          },(done,callback)=>{

          }
      ]);
    //     }else{
    //        console.log("All User already classified");
    // }
    });

  },

  start: true,
  timeZone: 'Asia/Jakarta',
});
