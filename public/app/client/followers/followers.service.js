angular.module('TwikipediaClient')
  .factory('FollowersService', FollowersService);

var urlFollowers = location.origin + '/api/user/followers/';

FollowersService.$inject = ['$http', '$q'];

function FollowersService($http, $q) {
  return {
    getAllFollowers: getAllFollowers,
    doTheJobs: doTheJobs,
  };

  function getAllFollowers() {
    var def = $q.defer();

    return $http.get(urlFollowers + 'list')
      .success(userFollowers)
      .error(errUserFollowers);

    function userFollowers(response) {
      def.resolve(response);
    }

    function errUserFollowers() {
      def.reject('Error GET detail User');
    }

    return def.promise;
  }

  function doTheJobs() {
    return $http({
      method: 'POST',
      url: urlFollowers + 'timeline',
    });
  }
}
