angular.module('TwikipediaAdmin')
  .factory('PreprocessingService', PreprocessingService);

var urlPreprocessingTweets = location.origin + '/api/preprocessing/twitter';
var urlPreprocessingWikipedia = location.origin + '/api/preprocessing/wikipedia';

PreprocessingService.$inject = ['$http', '$q'];
function PreprocessingService($http, $q) {
  return {
    preprocessingTweets: preprocessingTweets,
    preprocessingWikipedia: preprocessingWikipedia,
  };

  function preprocessingTweets() {
    return $http({
      method: 'POST',
      url: urlPreprocessingTweets,
    });
  }

  function preprocessingWikipedia() {
    return $http({
      method: 'POST',
      url: urlPreprocessingWikipedia,
    });
  }
}
