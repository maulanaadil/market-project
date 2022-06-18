const async = require('async');


const UserFollowerTimeline = require('../models/UserFollowerTimeline');

/**
 * GET /user/besttime
 * GET BEST TIME TO TWEET TIMES
 */
exports.bestTimeToTweet = (req, res, next) => {
  //ngambil tweet dari follower pengguna yang udah di save di database
  UserFollowerTimeline.find({"userId" : req.user._id}, {"tweets.time" : 1}, (err, followers) => {
    async.waterfall([
      changeToHours,
      setBestTime,
      (bestTime, callback) => {
        console.log(bestTime);
        res.status(200).json({
          statusCode: 200,
          message: 'succes get best time to tweet',
          data: bestTime,
        });
      },
    ]);
    /**
     * setBestTime dibuat untuk menentukan besttime, dari rata2 waktu tweet dikirim oleh follower
     */
    function setBestTime(hours, callback) {
      let bestTime = {
        t0to3: 0,
        t3to6 : 0,
        t6to9 : 0,
        t9to12: 0,
        t12to15: 0,
        t15to18: 0,
        t18to21: 0,
        t21to24: 0,
      };

      hours.map(hour => {
        if ((hour < 3) && (hour >= 0)) bestTime.t0to3 += 1;
        if ((hour < 6) && (hour >= 3)) bestTime.t3to6 += 1;
        if((hour < 9)&& (hour >= 6)) bestTime.t6to9 +=1;
        if ((hour < 12) && (hour >= 9)) bestTime.t9to12 += 1;
        if ((hour < 15) && (hour >= 12)) bestTime.t12to15 += 1;
        if ((hour < 18) && (hour >= 15)) bestTime.t15to18 += 1;
        if ((hour < 21) && (hour >= 18)) bestTime.t18to21 += 1;
        if ((hour <= 24) && (hour >= 21)) bestTime.t21to24 += 1;
      });

      callback(null, bestTime);
    }
    //dipakai buat mengambil jam dari tanggal tweet 
    function changeToHours(callback) {
      let tweetTime = [];
      var i = 0;
      followers.map((follower) => {
        follower.tweets.map(tweet => {
          if(i <= 2000){
            tweetTime.push(tweet.time.getHours());
          }
          i++;
        });
      });

      callback(null, tweetTime);
    }
  });
};