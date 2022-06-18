angular.module('TwikipediaClient')
  .factory('BuzzerServices', BuzzerServices);

var urlBuzzer = location.origin + '/api/new-buzzer';
var urlFollowers = location.origin+ '/api/user/followers';
BuzzerServices.$inject = ['$http', '$q'];

function BuzzerServices($http, $q) {
  return {
    getAllFollowers: getAllFollowers,
    doTheJobs: doTheJobs,
  };

  function getAllFollowers() {
    var def = $q.defer();

    return $http.get(urlBuzzer)
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
