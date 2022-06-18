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
 * GET /api/twitter/trainingset
 */
exports.getAllTrainingSet = function(req, res, next) {
  TrainingSet.find({}, (err, data) => {
    if (err) next(err);

    res.json({
      statusCode: 200,
      message: 'success get all data trainig tweets',
      data,
    });
  });
};

/**
 * DELETE /api/twitter/trainingset/:id
 */
exports.deleteTrainingsetById = (req, res, next) => {
  const id = req.params.id;
  TrainingSet.findByIdAndRemove(id, (err, data) => {
    if (err) next(err);

    res.status(204).json({
      statusCode: 204,
      message: 'Training tweets has been deleted',
    });
  });
};

/**
 * POST /api/twitter/trainingset
 */
exports.addTrainingSetTweets = (req, res, next) => {
  const TestingSet = require('../models/Testing');

  const trainingData = {
    tweet: req.body.tweet,
    categoryName: req.body.category,
  };

  const newTrainingSet = new TestingSet(trainingData);
  newTrainingSet.save((err) => {
    if (err) next(err);

    res.status(201).json({
      statusCode: 201,
      message: `Tweet added to category ${trainingData.categoryName}`,
    });
  });
};

/**
 * POST /api/twitter/trainingset/timeline
 */
exports.addTrainingSetTimeline = (req, res, next) => {
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: req.user.tokens.accessToken,
    access_token_secret: req.user.tokens.tokenSecret,
  });

  let params = {
    user_id: Number(req.body.user_id),
    count: 200,
  };
  let category = req.body.category;

  T.get('statuses/user_timeline', params, (err, timeline, response) => {
    timeline.map(t => {
      let trainingData = new TrainingSet({
        tweet: t.text,
        categoryName: category,
      });

      trainingData.save(err => {
        if (err) next(err);
      });
    });

    res.status(201).json({
      statusCode: 201,
      message: `User ${timeline[0].user.name} has been added to ${category}`,
    });
  });
};