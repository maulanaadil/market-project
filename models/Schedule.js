const mongoose = require('mongoose');

const ScheduleTweetsSchema = new mongoose.Schema({
  token: Object,
  tweet: String,
  lat: Number,
  long: Number,
  userId: String,
  time: Date,
  countDown: String,
  image : String,
  facebookToken : String,
  blast : Boolean,
  img_name : String,
  category : String 
}, {
  timestamps: true,
});

const ScheduleTweets = mongoose.model('ScheduleTweets', ScheduleTweetsSchema);

module.exports = ScheduleTweets;
