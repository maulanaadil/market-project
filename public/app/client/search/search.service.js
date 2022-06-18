angular.module('TwikipediaClient')
  .factory('SearchService', SearchService);

var urlSearch = location.origin + '/api/twitter/search';
var urlTwitter = location.origin + '/api/twitter/';

SearchService.$inject = ['$http', '$q'];
function SearchService($http, $q) {
  return {
    searchAnything: searchAnything,
    followUser: followUser,
    unfollowUser: unfollowUser,
  };

  function searchAnything(query) {
    query = escape(query);
    return $http({
      method: 'POST',
      url: urlSearch + '?q=' + query + '&type=tweets',
      // url: urlSearch + '?q=' + query + '&type=user',
    });
  }

  function followUser(id) {
    return $http({
      method: 'POST',
      url: urlTwitter + 'follow/' + id,
    });
  }

  function unfollowUser(id) {
    return $http({
      method: 'POST',
      url: urlTwitter + 'unfollow/' + id,
    });
  }
}
