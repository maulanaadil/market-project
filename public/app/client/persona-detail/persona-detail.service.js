angular.module('TwikipediaClient')
  .factory('PersonaDetailService', PersonaDetailService);

var urlPersona = location.origin + '/api/audience/';

PersonaDetailService.$inject = ['$q', '$http'];

function PersonaDetailService($q, $http) {
  return {
    getPersona : getPersona
  };
  function getPersona(id){
    var def = $q.defer();

    return $http.get(urlPersona+id)
      .success(persona)
      .error(error);

    function persona(response) {
      def.resolve(response);
    }

    function error() {
      def.reject('Error GET detail User');
    }

    return def.promise;
  }
}