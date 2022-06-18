angular.module('TwikipediaClient')
  .controller('PersonaCtrl', PersonaCtrl)

PersonaCtrl.$inject = ['PersonaService', 'ActionService', '$http'];
function PersonaCtrl(PersonaService, ActionService, $http) {
  let vm = this;

  PersonaService.getPersona()
  .then(getPersona);

  function getPersona(response) {
    vm.persona = response.data.results;
  }
}
