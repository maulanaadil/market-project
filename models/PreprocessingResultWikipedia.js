const mongoose = require('mongoose');

const WikipediaPreprocessingResultSchema = new mongoose.Schema({
  categoryName: String,
  words: Array,
});

const WikipediaPreprocessingResult = mongoose.model('WikipediaPreprocessingResult', WikipediaPreprocessingResultSchema);

module.exports = WikipediaPreprocessingResult;
