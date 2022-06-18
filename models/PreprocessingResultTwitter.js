const mongoose = require('mongoose');

const TwitterPreprocessingResultSchema = new mongoose.Schema({
  categoryName: String,
  words: Array,
});

const TwitterPreprocessingResult = mongoose.model('TwitterPreprocessingResult', TwitterPreprocessingResultSchema);

module.exports = TwitterPreprocessingResult;
