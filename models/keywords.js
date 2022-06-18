const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    "keyword" : String,
    "post": Object,
    "engagement": Object,
    "relevance_keyword": Array,
    "relevance_content": Array
});

const model = mongoose.model('keyword', schema);

module.exports = model;