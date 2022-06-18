angular.module('TwikipediaClient')
  .factory('PersonaService', PersonaService);

var urlPersona = location.origin + '/api/audience';

PersonaService.$inject = ['$q', '$http'];
function PersonaService($q, $http) {
  return {
    getPersona : getPersona
  };
  function getPersona(){
    var def = $q.defer();

    return $http.get(urlPersona)
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
