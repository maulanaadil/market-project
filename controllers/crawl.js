const Xray = require('x-ray');
const Article = require('../models/Article');

const x = Xray();

/**
 * POST /api/wikipedia
 * Add new article to article collections
 */
exports.addArticleWikipedia = (req, res, next) => {
  // let subCategory = req.body.subCategory.replace(/\s/g,  '').split(',');

  let data = {
    title: req.body.title,
    article: req.body.article,
    category: {
      categoryName: req.body.categoryName,
      subCategory: req.body.subCategory,
    },
    preStatus: false,
  };

  let newArticle = new Article(data);

  console.log(data);
  newArticle.save(response => {
    console.log(response);
    res.status(201).json(response);
  });
};

/**
 * GET /api/wikipedia
 * Get all article from wikipedia
 *
 * GET /api/wikipedia?q=query
 * Crawl an article from wikipedia with same query
 */
exports.getAllArticleWikipedia = (req, res, next) => {
  if (req.query.q !== undefined) {
    let q = req.query.q;
    q = q.replace(/\s|%20/g, '_').replace(q.charAt(0), q.charAt(0).toUpperCase());

    return x('https://id.wikipedia.org/wiki/' + q, '#content', {
      title: '#firstHeading',
      article: '#mw-content-text@html',
      subCategory: ['#mw-normal-catlinks ul li'],
    })((err, data) => {
      console.log(data);
      if (data.article.search(/Tidak ada teks di halaman ini/) === -1) {
        res.status(200).json({
          q,
          data,
        });
      } else {
        res.status(404).json({
          status: 404,
          message: 'Article you search not found',
        });
      }
    });
  }

  Article.find({}, {
    title: 1,
    category: 1,
  }, (err, article) => {
    if (err) next(err);

    res.status(200).json({
      statusCode: 200,
      message: 'success get all article wikipedia',
      data: article,
    });
  });
};

/**
 * GET /api/wikipedia/:id
 * Get article wikipedia by ID
 */
exports.getArticleWikipedia = (req, res, next) => {
  let id = req.params.id;
  Article.findById(id, (err, article) => {
    if (err) throw err;

    res.json({
      statusCode: 200,
      message: 'success get data article',
      data: article,
    });
  });
};

/**
 * DELETE /api/wikipedia/:id
 * Delete article from wikipedia by '_id'
 */
exports.deleteArticleWikipedia = (req, res, next) => {
  const id = req.params.id;
  Article.findByIdAndRemove(id, (err, article) => {
    if (err) next(err);

    res.json({
      statusCode: 200,
      message: `${article.title} has been deleted`,
    });
  });
};
