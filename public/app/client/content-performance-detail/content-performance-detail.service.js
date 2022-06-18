angular.module('TwikipediaClient')
  .factory('ContentPerformanceDetailService', ContentPerformanceDetailService);

  var url = location.origin + '/api/content-performance/';

ContentPerformanceDetailService.$inject = ['$q', '$http'];
function ContentPerformanceDetailService($q, $http) {
  return {
    getContent : getContent
  };
  function getContent(id){
    var def = $q.defer();

    return $http.get(url+id)
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
