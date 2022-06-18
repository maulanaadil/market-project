const express = require('express');
const FB = require('fb');
const api = express.Router();

const UserController = require('../controllers/user');
const AdminController = require('../controllers/admin');
const CategoriesController = require('../controllers/categories');
const TwitterController = require('../controllers/twitter');
const CrawlController = require('../controllers/crawl');
const PreprocessingController = require('../controllers/preprocessing');
const DashboardController = require('../controllers/dashboard');
const FollowersController = require('../controllers/followers');
const BttController = require('../controllers/btt');
const TrainingSet = require('../controllers/trainingset');
const ScheduleController = require('../controllers/schedule');
const UserNearByController = require('../controllers/user_nearby');
const Sentiment = require('../controllers/sentiment');
const Buzzer = require('../controllers/buzzer');
const DM = require('../controllers/dm');
const CreatePost = require('../controllers/create-post');
const TwitterAds = require('../controllers/twitter-ads');
const Audience = require('../controllers/audience');
const Keyword = require('../controllers/keyword');
const Content = require('../controllers/content_performance');


api.get('/audience', Audience.getPersona);
api.get('/audience-schedule', Audience.getSchedulePersona);
api.get('/audience/:persona_id', Audience.getPersonaId);
api.get('/content-performance', Content.getContent);
api.get('/content-performance/:id', Content.getContentId);
api.post('/keywords', Keyword.searchKeywords);
/**
 * Twitter routing
 */
api.get('/suggest/interest', TwitterAds.suggestTargeting);
api.get('/create-ads', UserController.ensureAuthenticated, TwitterAds.createAds);
/**
 * Twitter Original
 */
api.post('/create-post', UserController.ensureAuthenticated,CreatePost.createPost);
api.get('/feeds', TwitterController.getTimeline);
api.get('/tweet-id', TwitterController.getTweetById);
api.get('/trends', TwitterController.getTrends);
api.get('/dm',DM.getDM, UserController.ensureAuthenticated);
api.post('/dm',DM.sendDM, UserController.ensureAuthenticated);
api.get('/dm/:id',DM.getDMId, UserController.ensureAuthenticated);
api.get('/new-buzzer',UserController.ensureAuthenticated,Buzzer.getAllBuzzer);
api.get('/sentiment',Sentiment.mentions,UserController.ensureAuthenticated);
api.get('/mentions',TwitterController.mention,UserController.ensureAuthenticated);
api.get('/user', UserController.ensureAuthenticated, TwitterController.getUserProfile);
api.post('/user/followers/timeline', UserController.ensureAuthenticated, FollowersController.getUserFollowersTimeline);
api.post('/user/followers/timeline/add', UserController.ensureAuthenticated, FollowersController.addUserTimeline);
api.get('/user/followers/list', UserController.ensureAuthenticated, FollowersController.getAllFollowersUser);
api.get('/user/followers/category/:category', UserController.ensureAuthenticated, FollowersController.getUserFollowerCategory);
// api.get('/user/followers/timeline', UserController.ensureAuthenticated, TwitterController.getUserFollowersTimeline);
api.post('/user/post', UserController.ensureAuthenticated, TwitterController.postTweet);
api.post('/user/blast/post', UserController.ensureAuthenticated, TwitterController.blastTweet);
//api.post('/user/besttime', UserController.ensureAuthenticated, TwitterController.postBestTimeToTweet);
api.get('/user/besttime', UserController.ensureAuthenticated, BttController.bestTimeToTweet);

api.post('/user/post/schedule', UserController.ensureAuthenticated, ScheduleController.newScheduleTweet);
api.post('/user/post/schedule/image', UserController.ensureAuthenticated, ScheduleController.scheduleWithImage);
api.get('/user/post/schedule', UserController.ensureAuthenticated, ScheduleController.getScheduleTweets);
api.delete('/user/post/schedule/:id', UserController.ensureAuthenticated, ScheduleController.deleteScheduleTweet);
api.put('/user/post/schedule/:id', UserController.ensureAuthenticated, ScheduleController.updateScheduleTweet);
api.post('/user/post/image',UserController.ensureAuthenticated,TwitterController.postImage);
// API TWITTER
api.post('/twitter/search', UserController.ensureAuthenticated, TwitterController.searchTweets);
api.post('/twitter/search/geotes', UserNearByController.nearby);
api.post('/twitter/follow/:id', UserController.ensureAuthenticated, FollowersController.followUser);
api.post('/twitter/unfollow/:id', UserController.ensureAuthenticated, FollowersController.unfollowUser);
api.get('/twitter/trainingset', UserController.ensureAuthenticated, TrainingSet.getAllTrainingSet);
api.post('/twitter/trainingset', UserController.ensureAuthenticated, TrainingSet.addTrainingSetTweets);
api.post('/twitter/trainingset/timeline', UserController.ensureAuthenticated, TrainingSet.addTrainingSetTimeline);
api.delete('/twitter/trainingset/:id', UserController.ensureAuthenticated, TrainingSet.deleteTrainingsetById);

// API USERx
api.get('/admin', UserController.ensureAuthenticated, AdminController.getAllUser);
api.post('/admin', UserController.ensureAuthenticated, AdminController.addUser);

api.get('/admin/:id', UserController.ensureAuthenticated, AdminController.getUser);
api.put('/admin/:id', UserController.ensureAuthenticated, AdminController.updateUser);
api.delete('/admin/:id', UserController.ensureAuthenticated, AdminController.deleteUser);

// API CATEGORY
api.get('/category', UserController.ensureAuthenticated, CategoriesController.getAllCategory);
api.post('/category', UserController.ensureAuthenticated, CategoriesController.addCategory);

api.get('/category/:id', UserController.ensureAuthenticated, CategoriesController.getCategory);
api.put('/category/:id', UserController.ensureAuthenticated, CategoriesController.updateCategory);
api.delete('/category/:id', UserController.ensureAuthenticated, CategoriesController.deleteCategory);

// API CRAWLING
api.get('/wikipedia', UserController.ensureAuthenticated, CrawlController.getAllArticleWikipedia);
api.post('/wikipedia', UserController.ensureAuthenticated, CrawlController.addArticleWikipedia);

api.get('/wikipedia/:id', UserController.ensureAuthenticated, CrawlController.getArticleWikipedia);
api.delete('/wikipedia/:id', UserController.ensureAuthenticated, CrawlController.deleteArticleWikipedia);

api.post('/preprocessing/twitter', UserController.ensureAuthenticated, PreprocessingController.preprocessingTweets);
api.post('/preprocessing/wikipedia', UserController.ensureAuthenticated, PreprocessingController.preprocessingWikipedia);

api.get('/stats', UserController.ensureAuthenticated, DashboardController.stats);
api.get('/count', UserController.ensureAuthenticated, DashboardController.followerCategory);

api.get('/friends', (req, res, next)=>{
    FB.setAccessToken(req.user.facebookToken);
    var post = [];
    FB.api(
        "/me/taggable_friends",
        function (response) {
          if (response && !response.error) {
            // (response.data).map((val)=>{
            //     FB.api(`/${val.id}/feed`, (response)=>{
            //         if (response && !response.error) {
            //             post.push({
            //                 userId : val.id,
            //                 post : response.data
            //             })
            //         }
            //     })
            // })
            res.json(response);
          }
        }
    );
});
module.exports = api;
