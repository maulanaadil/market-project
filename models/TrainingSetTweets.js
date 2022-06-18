const mongoose = require('mongoose');

const TrainingSetTweetsSchema = new mongoose.Schema({
  tweet: String,
  categoryName: String,
});

const TrainingSetTweets = mongoose.model('TrainingSetTweets', TrainingSetTweetsSchema);

module.exports = TrainingSetTweets;
