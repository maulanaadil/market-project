const mongoose = require('mongoose');

const wordsWeightCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    unique: true,
  },
  words: [{
    word: String,
    weight: Number,
  },
],
});

const WordsWeightCategory = mongoose.model('WordsWeightCategory', wordsWeightCategorySchema);

module.exports = WordsWeightCategory;
