const mongoose = require('mongoose');

const TestingTweetSchema = new mongoose.Schema({
  tweet: String,
  categoryName: String,
});

const TestingTweet = mongoose.model('TestingTweet', TestingTweetSchema);

module.exports = TestingTweet;
