angular.module('TwikipediaClient')
  .controller('ContentPerformanceDetailCtrl', ContentPerformanceDetailCtrl)

ContentPerformanceDetailCtrl.$inject = ['ContentPerformanceDetailService', 'ActionService', '$http', '$stateParams'];
function ContentPerformanceDetailCtrl(ContentPerformanceDetailService, ActionService, $http, $stateParams) {
  let vm = this;
  vm.profile = {
    name : localStorage.getItem('name'),
    username : localStorage.getItem('username'),
    image_url : localStorage.getItem('picture')
  }
  ContentPerformanceDetailService.getContent($stateParams.id)
    .then(getData);

    function getData(response) {
      console.log(response);
      vm.content = response.data.results;
    }
}