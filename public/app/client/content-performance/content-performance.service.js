angular.module('TwikipediaClient')
  .factory('ContentService', ContentService);

var url = location.origin + '/api/content-performance';

ContentService.$inject = ['$q', '$http'];
function ContentService($q, $http) {
  return {
    getContent : getContent
  };
  function getContent(){
    var def = $q.defer();

    return $http.get(url)
      .success(result)
      .error(error);

    function result(response) {
      def.resolve(response);
    }

    function error() {
      def.reject('Error search keyword');
    }

    return def.promise;
  }
}
