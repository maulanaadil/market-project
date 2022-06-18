const mongoose = require('mongoose');

const schema = new mongoose.Schema({
            "cluster_number": Number,
            "cluster_name": String,
            "cluster_size": Number,
            "demographics": Object,
            "behaviour": Object,
            "user": Array
});

const model = mongoose.model('audience', schema);

module.exports = model;