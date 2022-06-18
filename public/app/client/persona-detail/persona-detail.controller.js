angular.module('TwikipediaClient')
  .controller('PersonaDetailCtrl', PersonaDetailCtrl)

PersonaDetailCtrl.$inject = ['PersonaDetailService', 'ActionService', '$http', '$stateParams', ];

function PersonaDetailCtrl(PersonaDetailService, ActionService, $http, $stateParams) {
  let vm = this;

  PersonaDetailService.getPersona($stateParams.id)
  .then(getPersona);

  function getPersona(response) {
    vm.persona = response.data.results;
    // var interest = [];
    // var total_interest = [];
    // (vm.persona.behaviour.interest).map((val)=>{
    //   vm.interest.push(val.interest_name)
    //   vm.total_interest.push(val.percentage * 100)
    // })
  }
}
