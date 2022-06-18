const mongoose = require('mongoose');

const UserFollowerTimelineSchema = new mongoose.Schema({
  userId: String,
  username: String,
  userDetail: Object,
  tweets: Array,
});

UserFollowerTimelineSchema.index({ "$**" : "text"});
const UserFollowerTimeline = mongoose.model('UserFollowerTimeline', UserFollowerTimelineSchema);

module.exports = UserFollowerTimeline;
