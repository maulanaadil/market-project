angular.module('TwikipediaClient')
  .controller('FollowersCtrl', FollowersCtrl);

FollowersCtrl.$inject = ['FollowersService', 'NgTableParams', 'MentionService'];

function FollowersCtrl(FollowersService, NgTableParams) {
  var vm = this;
  vm.followers = [];
  // setInterval(() => {
  //   FollowersService.getAllFollowers()
  //     .then(getAllFollowers);
  // }, 30000);

  FollowersService.getAllFollowers()
    .then(getAllFollowers);

  function getAllFollowers(response) {
    console.log(response);

    vm.followers = response.data.followers;
    vm.tableFollowers = new NgTableParams({
      count: 10,
    }, {
      counts: [10, 50, 100],
      dataset: vm.followers,
    });
  }

  vm.doTheJobs = doTheJobs;

  function doTheJobs() {

    document.querySelector('.follower-before').style.display = 'none';
    document.querySelector('.follower-after').style.visibility = 'visible';

    FollowersService.doTheJobs()
      .success(get)
      .error(errorJob);

    function get(res) {
      
    }

    function errorJob(err) {
      console.log(err);
    }
  }
}
