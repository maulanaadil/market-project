const async = require('async');

const Article = require('../models/Article');
const Category = require('../models/Category');
const TrainingSetTweets = require('../models/Testing');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const UserFollowers = require('../models/UserFollowerTimeline');
const Followers = require('../models/Followers');

let data = {};

exports.stats = (req, res, next) => {
  async.waterfall([
    getUser,
    getArticle,
    getCategory,
    getTrainingSetTweets,
    getSchedule,

    function (stats, callback) {
      res.status(200).json({
        statusCode: 200,
        message: 'success get all stats',
        data,
      });
    },
  ], (err, result) => {
    console.log(err);
    console.log(result);
  });
};

function getUser(callback) {
  User.count({}, (err, count) => {
    data.User = count;

    callback(null, data);
  });
}

function getArticle(stats, callback) {
  Article.count({}, (err, count) => {
    data.Article = count;

    callback(null, data);
  });
}

function getCategory(stats, callback) {
  Category.count({}, (err, count) => {
    data.Category = count;

    callback(null, data);
  });
}

function getTrainingSetTweets(stats, callback) {
  TrainingSetTweets.count({}, (err, count) => {
    data.TrainingSetTweets = count;

    callback(null, data);
  });
}

function getSchedule(stats, callback) {
  Schedule.count({}, (err, count) => {
    data.Schedule = count;

    callback(null, data);
  });
}

//count follower category
let follower = {};
exports.followerCategory = (req,res,next)=>{
  async.parallel({
    Health : function (callback) {
        async.parallel({
          a: function(callback){
            const params = {
              username : req.user.username,
              "userDetail.category" : "Health"
            };
            UserFollowers.count(params, (err, count) => {
              callback(null, count);
            });
          },
          b: function(callback){
            const params = {
              "userDetail.category" : "Health"
            };
            Followers.count(params, (err, count) => {
              callback(null, count);
            });
          }
        }, (err, result)=>{
            var a = result.a + result.b;
            callback(null, a)
        });
       
      },
    Foods: function (callback) {
      async.parallel({
        a: function(callback){
          const params = {
            username : req.user.username,
            "userDetail.category" : "Foods"
          };
          UserFollowers.count(params, (err, count) => {
            callback(null, count);
          });
        },
        b: function(callback){
          const params = {
            "userDetail.category" : "Foods"
          };
          Followers.count(params, (err, count) => {
            callback(null, count);
          });
        }
      }, (err, result)=>{
          var a = result.a + result.b;
          callback(null, a)
      });
      },
     Life : function (callback) {
      async.parallel({
        a: function(callback){
          const params = {
            username : req.user.username,
            "userDetail.category" : "Fashion"
          };
          UserFollowers.count(params, (err, count) => {
            callback(null, count);
          });
        },
        b: function(callback){
          const params = {
            "userDetail.category" : "Fashion"
          };
          Followers.count(params, (err, count) => {
            callback(null, count);
          });
        }
      }, (err, result)=>{
          var a = result.a + result.b;
          callback(null, a)
      });
      },
      Travel : function (callback) {
        async.parallel({
          a: function(callback){
            const params = {
              username : req.user.username,
              "userDetail.category" : "Travel"
            };
            UserFollowers.count(params, (err, count) => {
              callback(null, count);
            });
          },
          b: function(callback){
            const params = {
              "userDetail.category" : "Travel"
            };
            Followers.count(params, (err, count) => {
              callback(null, count);
            });
          }
        }, (err, result)=>{
            var a = result.a + result.b;
            callback(null, a)
        });
      },
      Sports:function (callback) {
        async.parallel({
          a: function(callback){
            const params = {
              username : req.user.username,
              "userDetail.category" : "Sports"
            };
            UserFollowers.count(params, (err, count) => {
              callback(null, count);
            });
          },
          b: function(callback){
            const params = {
              "userDetail.category" : "Sports"
            };
            Followers.count(params, (err, count) => {
              callback(null, count);
            });
          }
        }, (err, result)=>{
            var a = result.a + result.b;
            callback(null, a)
        });
      }
  }, (err, result) => {
    console.log(err);
    res.status(200).json({
      statusCode: 200,
      message: 'success get all follower count',
      follower : result
    });
  });
};


