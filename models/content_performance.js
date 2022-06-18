const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    "performance": String,
    "tweet_id": Number,
    "tweet_id_str": String,
    "in_reply_to_status_id": Number,
    "in_reply_to_status_id_str": String,
    "time": { type : Date, default: Date.now },
    "text": String,
    "tweet_tokenize": Array,
    "tweet_type": String,
    "engagement":Object,
    "sentiment_score": Object
});

const model = mongoose.model('content_performance', schema);

module.exports = model;