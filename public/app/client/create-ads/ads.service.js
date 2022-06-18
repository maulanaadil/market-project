angular.module('TwikipediaClient')
  .factory('AdsService', AdsService);

var urlFeed = location.origin + '/api/';

AdsService.$inject = ['$q', '$http'];
function AdsService($q, $http) {
  return {
    getUserFeed : getUserFeed
  };
  
  function getUserFeed(){
    var def = $q.defer();

        return $http.get(urlFeed+'feeds')
            .success(feed)
            .error(err);

        function feed(response) {
            def.resolve(response);
        }
        function err() {
            def.reject('Error GET direct messages');
        }
        return def.promise;
  }
}
