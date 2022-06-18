const token = require('./modules/nalapa').tokenizer;
const clean = require('./modules/nalapa').cleaner;
const Word = require('./modules/nalapa').word;
const feature = require('./modules/nalapa').feature;
const async = require('async');
const unEscape = require('./modules/unescape');
const _ = require('lodash');

const TwitterPreprocessingResult = require('../models/PreprocessingResultTwitter');
const TwitterTrainingSetTweets = require('../models/Testing');
const WikipediaPreprocessingResult = require('../models/PreprocessingResultWikipedia');
const WikipediaTrainingSetArticle = require('../models/Article');

const CronJob = require('cron').CronJob;
const Tfidf = require('node-tfidf');
const tfidf = new Tfidf();

// SCHEDULE PREPROCESSING TWEETS
// const preprocessingTweetsSchedule = new CronJob({
//   cronTime: '0 0 0 * * *',
//   onTick: () => {
//     TwitterPreprocessingResult.remove({}, (err) => console.log('All Document Deleted'));

//     TwitterTrainingSetTweets.find({}, (err, tweets) => {
//       tweets.map(data => {
//         async.waterfall([
//           function getData(callback) {
//             callback(null, data.tweet, data.categoryName);
//           },

//           changeUnicode,
//           doCaseFodling,
//           removeMention,
//           removeURL,
//           removeSymbol,
//           removeWhiteSpace,
//           doTokenizing,
//           doStemming,
//           doCleaning,
//           saveToTwitterPreprocessingResult,

//         ], (err, result) => {
//           console.log(err);
//           console.log(result);
//         });
//       });
//     });
//   },

//   start: true,
//   timeZone: 'Asia/Jakarta',
// });

// SCHEDULE PREPROCESSING WIKIPEDIA
// const preprocessingWikipedaSchedule = new CronJob({
//   cronTime: '0 0 3 * * *',
//   onTick() {
//     WikipediaPreprocessingResult.remove({}, (err) => console.log(err));

//     WikipediaTrainingSetArticle.find({}, (err, articles) => {
//       articles.map(article => {
//         async.waterfall([
//           function getData(callback) {
//             callback(null, article.article, article.category.categoryName);
//           },

//           removeTags,
//           changeUnicode,
//           doCaseFodling,
//           removeURL,
//           removeSymbol,
//           removeWhiteSpace,
//           doTokenizing,
//           doStemming,
//           doCleaning,
//           saveToWikipediaPreprocessingResult,

//         ], (err, result) => {
//           console.log(err);
//           console.log(result);
//         });
//       });
//     });
//   },

//   start: true,
//   timeZone: 'Asia/Jakarta',
// });


/**
 * POST /api/preprocessing/twitter
 */
exports.preprocessingTweets = (req, res, next) => {
  TwitterPreprocessingResult.remove({}, (err) => console.log('All Document Deleted'));

  TwitterTrainingSetTweets.find({}, (err, tweets) => {
    tweets.map((data, i) => {
      let length = tweets.length - 1;

      async.waterfall([
        function getData(callback) {
          callback(null, data.tweet, data.categoryName);
        },

        changeUnicode,
        doCaseFodling,
        removeMention,
        removeURL,
        removeSymbol,
        removeWhiteSpace,
        doTokenizing,
        doStemming,
        doCleaning,
        saveToTwitterPreprocessingResult,

      ], (err, result) => {
        console.log(err);
        console.log(result);

        if (i === length) {
          res.status(201).json({
            statusCode: 201,
            message: 'preprocessing tweets finished',
          });
        }
      });
    });
  });
};

exports.preprocessingWikipedia = (req, res, next) => {
  WikipediaPreprocessingResult.remove({}, (err) => console.log(err));

  WikipediaTrainingSetArticle.find({}, (err, articles) => {
    articles.map((article, i) => {
      let length = articles.length - 1;

      async.waterfall([
        function getData(callback) {
          callback(null, article.article, article.category.categoryName);
        },

        removeTags,
        changeUnicode,
        doCaseFodling,
        removeURL,
        removeSymbol,
        removeWhiteSpace,
        doTokenizing,
        doStemming,
        doCleaning,
        saveToWikipediaPreprocessingResult,

      ], (err, result) => {
        console.log(err);
        console.log(result);
        if (i === length) {
          res.status(201).json({
            statusCode: 201,
            message: 'preprocessing articles finished',
          });
        }
      });
    });
  });
};

exports.preprocessingFollowerTweets = (tweets, timeline) => {
  let dataTweets = [];
  if (tweets !== null && tweets !== 'error') {
    tweets.map((tweet, i) => {
      if (tweet.lang === 'in') {
        console.log('Masuk karena bahasa indonesia');
        async.waterfall([
          function getData(callback) {
            callback(null, tweet.text, '');
          },

          changeUnicode,
          doCaseFodling,
          removeMention,
          removeURL,
          removeSymbol,
          removeWhiteSpace,
          doTokenizing,
          doStemming,
          doCleaning,
          classifiedTrainingSet,
          testingTweet,
          knn,

          function tweetCategory(category, callback) {
            console.log(category);
            tweets[i].category = category.category;

            dataTweets.push({
              category: category.category,
              lang: tweets[i].lang,
              text: tweets[i].text,
              time: tweets[i].time,
            });

            callback(null, tweets[i].category);
          },
        ], function finished(err, data) {
          console.log(data);
        });
      }
    });

    return dataTweets;
  } else {
    return tweets;
  }
};

function classifiedTrainingSet(text, category, callback) {
  TwitterPreprocessingResult.find({}, (err, trainings) => {
    tfidf.documents = [];
    trainings.map(training => {
      tfidf.addDocument(training.words);
    });
    callback(null, text, category, trainings);
  });
}

function testingTweet(test, category, trainings, callback) {
  let testingResult = [];
  tfidf.tfidfs(test, (i, weight) => {
    if (trainings[i].categoryName === undefined) {
      callback(null, {});
    }

    testingResult.push({
      weight,
      categoryName: trainings[i].categoryName,
    });
  });
  console.log(testingResult);
  callback(null, testingResult);
}

function saveTimelineToCollection(data, callback) {
  if (data === 'error') {
    console.log('User Not Found');
    callback(null);
  } else {
    let user = {
      'userDetail.userId': data.userDetail.userId,
    };

    // CHECK IF USER IS NOT FOUND
    UserFollowerTimeline.findOne(user, (err, user) => {
      if (user === null) {
        let newTimelineUser = new UserFollowerTimeline(data);
        newTimelineUser.save((err) => {
          console.log('user saved #' + i + ' nama : ' + data.userDetail.name);
        });
      }
    });
    callback(null);
  }
}

function knn(testingResult, callback) {
  console.log('KNN');
  let sortedData = _.orderBy(testingResult, ['weight'], ['desc']);
  let getFiveData = _.take(sortedData, 5);
  let countDataCategory = _.countBy(getFiveData, 'categoryName');
  let countedByCategory = [];
  for (c in countDataCategory) {
    countedByCategory.push({
      category: c,
      count: countDataCategory[c],
    });
  }

  let testCategory = _.maxBy(countedByCategory, 'count');
  console.log(testCategory);
  callback(null, testCategory);
}

function removeTags(text, category, callback) {
  console.log('REMOVE TAGS');
  text = text.replace(/<(?:.|\n)*?>/gm, ' ');

  callback(null, text, category);
}

function changeUnicode(text, category, callback) {
  console.log('CHANGE UNICODE');
  text = unEscape(text);

  callback(null, text, category);
}

function removeMention(text, category, callback) {
  console.log('REMOVE MENTION');
  text = text.replace(/@\w+/g, ' ');

  callback(null, text, category);
}

function removeWhiteSpace(text, category, callback) {
  console.log('REMOVE WHITESPACE');
  text = text.replace(/\s\s+|\n/g, ' ');

  callback(null, text, category);
}

function removeURL(text, category, callback) {
  console.log('REMOVE URL');
  text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

  callback(null, text, category);
}

function removeSymbol(text, category, callback) {
  console.log('REMOVE SYMBOL');
  text = text.replace(/[^a-zA-Z ]/g, '');

  callback(null, text, category);
}

function doCaseFodling(text, category, callback) {
  console.log('CASE FOLDING');
  text = text.toLowerCase();

  callback(null, text, category);
}

function doTokenizing(text, category, callback) {
  console.log('TOKENIZING');
  text = token.tokenize(text);

  callback(null, text, category);
}

function doStemming(text, category, callback) {
  console.log('STEMMING');
  let stemResult = [];

  text.map(function (e, i) {
    stemResult.push(Word.stem(e));
  });

  callback(null, stemResult, category);
}

function doCleaning(text, category, callback) {
  console.log('CLEANING');
  let nonStopWords = [];
  text.map(function (e, i) {
    if (!Word.isStopword(e) && e.length !== 1 && e !== 'xb' && e !== 'xbc' && e !== 'mm') {
      nonStopWords.push(e);
    }
  });

  callback(null, nonStopWords, category);
}

function saveToTwitterPreprocessingResult(text, category, callback) {
  let newPreprocessingResult = new TwitterPreprocessingResult({
    categoryName: category,
    words: text,
  });

  newPreprocessingResult.save((err) => {
    if (err) throw err;

    console.log(`Category ${category} has been added`);
  });

  callback(null);
}

function saveToWikipediaPreprocessingResult(text, category, callback) {
  let newPreprocessingResult = new WikipediaPreprocessingResult({
    categoryName: category,
    words: text,
  });

  newPreprocessingResult.save((err) => {
    if (err) throw err;

    console.log(`Category ${category} has been added`);
  });

  callback(null);
}
