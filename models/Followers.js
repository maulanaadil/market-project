const mongoose = require('mongoose');

const UserFollowerTimelineSchema = new mongoose.Schema({
  username: String,
  userDetail: Object,
  source : String,
});

const model = mongoose.model('static-follower', UserFollowerTimelineSchema);

module.exports = model;
