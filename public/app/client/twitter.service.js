angular.module('TwikipediaClient')
  .factory('TwitterService', TwitterService);

var urlTwitter = location.origin + '/api/twitter/';

TwitterService.$inject = ['$http', '$q'];
function TwitterService($http, $q) {
  return {
    followUser: followUser,
    unfollowUser: unfollowUser,
  };

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
