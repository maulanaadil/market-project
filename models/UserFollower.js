const mongoose = require('mongoose');

const UserFollowersSchema = new mongoose.Schema({
  userId: String,
  username: String,
  followers: Array,
  statusDone: Boolean,
  pointer: Number,
});

const UserFollowers = mongoose.model('UserFollowers', UserFollowersSchema);

module.exports = UserFollowers;
