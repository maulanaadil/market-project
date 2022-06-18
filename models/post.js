const mongoose = require('mongoose');

const PostTweet = new mongoose.Schema({
  tweet: String,
  userId: String,
  name : String,
  img_profile : String,
  image : String
}, {
  timestamps: true,
});

const model = mongoose.model('PostTweet', PostTweet);

module.exports = model;
