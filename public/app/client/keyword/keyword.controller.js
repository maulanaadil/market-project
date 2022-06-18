angular.module('TwikipediaClient')
  .controller('KeywordCtrl', KeywordCtrl)

KeywordCtrl.$inject = ['KeywordService', 'ActionService', '$http'];
function KeywordCtrl(KeywordService, ActionService, $http) {
  let vm = this;

  vm.search = function(data){
    console.log(data);
    KeywordService.search({keyword : data})
    .then(getData);

    function getData(response) {
      console.log(response)
      document.getElementById("results").style.display = "";
      vm.keyword = response.data.results;
    }
  }
}