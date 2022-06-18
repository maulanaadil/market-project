angular.module('TwikipediaClient')
  .factory('KeywordService', KeywordService);
  var url_keywords= location.origin + '/api/keywords';
  KeywordService.$inject = ['$q', '$http'];

function KeywordService($q, $http) {
  return {
    search : search
  };
  function search(data){
    var def = $q.defer();

    return $http.post(url_keywords, data)
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