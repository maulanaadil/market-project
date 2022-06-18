const express = require('express');
const api = express.Router();
const TwitterController = require('../../controllers/api/twitter');
const FollowersController = require('../../controllers/api/followers');
const UserController = require('../../controllers/user');
const Cognitive = require('../../controllers/api/cognitive');
const AzureML = require('../../controllers/api/azureml');

const CategoriesController = require('../../controllers/categories');
const Sentiment = require('../../controllers/api/sentiment');
const Buzzer = require('../../controllers/api/buzzer');
const Post = require('../../controllers/api/post');
const DataTraining = require('../../controllers/api/data-training');
const CreatePost = require('../../controllers/api/create-post');
const UserNearby = require('../../controllers/api/user-nearby');

api.post('/user-nearby', UserNearby.tes);
api.post('/create-post', CreatePost.createPost);
api.get('/training.data', DataTraining.datatest);
api.post('/feeds', TwitterController.getTimeline);
api.post('/trends', TwitterController.getTrends);
api.post('/mentions', TwitterController.mention);
api.get('/post',Post.getPost);
api.get('/new-buzzer',Buzzer.getAllBuzzer);
api.post('/buzzer', Buzzer.buzzer);
//sentiment
api.post('/sentiment',Sentiment.mentions);
//computer vision
api.post('/vision',Cognitive.computerVision);

api.post('/user/dashboard',TwitterController.dashboard);
api.post('/user/signin',UserController.signupUser);
api.post('/user/profile',TwitterController.getUserProfile);

api.post('/photo-blob',Cognitive.getPhotoScore);
api.post('/text',Cognitive.textAnalyze);
api.post('/typo',Cognitive.typoAnalyze);
api.post('/translate',Cognitive.translatorAnalyze);
api.post('/photo',Cognitive.computerVision);
api.get('/test',TwitterController.getAllUserFollowersIds);

api.get('/test/:id',TwitterController.timelines);

api.post('/user/post/tweet',TwitterController.postTweet);
api.post('/user/post/image', TwitterController.postImage);
api.post('/user/post/schedule', TwitterController.newScheduleTweet);
api.post('/user/post/schedule/image', TwitterController.scheduleWithImage);
api.post('/user/blast/post', TwitterController.blastTweet);
//besttime
api.post('/user/btt',TwitterController.bestTimeToTweet);

api.get('/user/post/schedule/:id', TwitterController.getScheduleTweets);
api.delete('/user/post/schedule/:id', TwitterController.deleteScheduleTweet);
api.put('/user/post/schedule/:id', TwitterController.updateScheduleTweet);
//followers

api.post('/user/followers/classification', TwitterController.followerClassification);
api.post('/user/followers/timeline/:id', FollowersController.getUserFollowersTimeline);
api.post('/user/followers/timeline/add', TwitterController.addUserTimeline);
api.post('/user/followers/category',FollowersController.getFollowerCategory);
api.post('/user/followers/:screen_name',FollowersController.getAllFollowersUser);
api.post('/user/followers/category/:category', FollowersController.getUserFollowerCategory);

//twitter
api.post('/twitter/search', TwitterController.searchTweets);
api.post('/twitter/follow/:id',  TwitterController.followUser);
api.post('/twitter/unfollow/:id', TwitterController.unfollowUser);
api.post('/twitter/search/geo', TwitterController.searchGeo);


api.get('/category', CategoriesController.getAllCategory);

// AzureML
api.post('/azure/classification', AzureML.tweetClassification);

module.exports = api;
