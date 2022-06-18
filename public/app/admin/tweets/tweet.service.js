angular.module('TwikipediaAdmin')
  .factory('TweetService', ArticleService);

var urlSearch = location.origin + '/api/twitter/search';
var urlTrainingTweets = location.origin + '/api/twitter/trainingset';

ArticleService.$inject = ['$http', '$q'];

function ArticleService($http, $q) {
  return {
    searchTweets: searchTweets,
    searchUsers: searchUsers,
    getAllTrainingTweets: getAllTrainingTweets,
    deleteTrainingTweetById: deleteTrainingTweetById,
    addToCategory: addToCategory,
    addTimelineToCategory: addTimelineToCategory,
  };

  function searchTweets(query) {
    return $http({
      method: 'POST',
      url: urlSearch + '?q=' + query + '&type=tweets',
    });
  }

  function searchUsers(query) {
    return $http({
      method: 'POST',
      url: urlSearch + '?q=' + query + '&type=user',
    })
  }

  function getAllTrainingTweets() {
    var def = $q.defer();

    return $http.get(urlTrainingTweets)
      .success(trainingTweets)
      .error(errTrainingTweets);

    function trainingTweets(response) {
      def.resolve(response);
    }

    function errTrainingTweets() {
      def.reject('Error GET detail User');
    }

    return def.promise;
  }

  function deleteTrainingTweetById(id) {
    return $http({
      method: 'DELETE',
      url: urlTrainingTweets + '/' + id,
    });
  }

  function addToCategory(tweet, category) {
    var data = {
      tweet: tweet,
      category: category,
    };

    return $http({
      method: 'POST',
      url: urlTrainingTweets,
      data: data,
    });
  }

  function addTimelineToCategory(id, category) {
    var data = {
      user_id: id,
      category: category,
    }

    return $http({
      method: 'POST',
      url: urlTrainingTweets + '/timeline',
      data: data
    })
  }
}