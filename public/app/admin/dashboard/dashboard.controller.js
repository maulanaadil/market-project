angular.module('TwikipediaAdmin')
  .controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$http'];

function DashboardCtrl($http) {
  var vm = this;
  console.log(localStorage.getItem('stats'));
  vm.stats = JSON.parse(localStorage.getItem('stats'));

  if ((localStorage.getItem('stats') === null) || (localStorage.getItem('stats') === undefined)) {
    $http.get(location.origin + '/api/stats')
      .then(getStats);
  }

  if (localStorage.getItem('stats') !== null) {
    $http.get(location.origin + '/api/stats')
      .then(getStats);
  }

  // } else {
  //   vm.stats = JSON.parse(localStorage.getItem('stats'));

  function getStats(response) {
    console.log(response);
    if (localStorage.getItem('stats') !== JSON.stringify(response.data.data)) {
      localStorage.setItem('stats', JSON.stringify(response.data.data));
      vm.stats = JSON.parse(localStorage.getItem('stats'));
    }
  }
}
