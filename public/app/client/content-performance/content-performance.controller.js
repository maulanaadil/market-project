angular.module('TwikipediaClient')
  .controller('ContentCtrl', ContentCtrl)

  ContentCtrl.$inject = ['ContentService', 'ActionService', '$http'];
function ContentCtrl(ContentService, ActionService, $http) {
  let vm = this;
  vm.profile = {
    name : localStorage.getItem('name'),
    username : localStorage.getItem('username'),
    image_url : localStorage.getItem('picture')
  }
  
  ContentService.getContent()
    .then(getData);

    function getData(response) {
      console.log(response);
      vm.tweet = response.data.results;
    }
}
