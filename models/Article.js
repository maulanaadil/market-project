const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
  },
  article: String,
  category: {
    categoryName: String,
    subCategory: [String],
  },
  preStatus: Boolean,
}, {
  timestamps: true,
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
