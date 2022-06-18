angular.module('TwikipediaClient')
  .controller('AdsController', AdsController)

AdsController.$inject = ['AdsService', 'PersonaService', 'ActionService', '$http', '$location'];
function AdsController(AdsService,PersonaService,  ActionService, $http, $location) {
  let vm = this;
  vm.interest = [];

  PersonaService.getPersona()
  .then(getPersona);

  function getPersona(response) {
    vm.persona = response.data.results;
  }
  AdsService.getUserFeed().then(getFeed);

  function getFeed(response){
      console.log(response);
      vm.feed = response.data.data;

      console.log(vm.feed);
  }
  vm.sendAds = function(data){
      ActionService.Succesed('Success Send Twitter Ads');
      $location.path("/create-ads");
  }
}
