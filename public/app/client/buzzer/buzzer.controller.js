angular.module('TwikipediaClient')
.controller('BuzzerCtrl', FollowersCtrl);

FollowersCtrl.$inject = ['BuzzerServices', 'NgTableParams', 'MentionService','$http','ActionService'];

function FollowersCtrl(BuzzerServices, NgTableParams,MentionService,$http,ActionService) {
  var vm = this;
  vm.followers = [];
  vm.username = localStorage.getItem('username');
  vm.ava = localStorage.getItem('picture');


  var length = 140;
  // setInterval(() => {
  //   FollowersService.getAllFollowers()
  //     .then(getAllFollowers);
  // }, 30000);

  BuzzerServices.getAllFollowers()
  .then(getAllFollowers);

  function getAllFollowers(response) {
    var i = 1;
    vm.followers = response.data.data.users;

    console.log("Data Followers")
    // console.log(vm.followers.data.users);
    // vm.tableFollowers = new NgTableParams({
    //   count: 10,
    // }, {
    //   counts: [10, 50, 100],
    //   dataset: vm.followers,
    // });
  }

  vm.doTheJobs = doTheJobs;
  vm.setMention = setMention; 
  vm.calLength = function (tweet) {
    var btn = document.querySelector('#tweet-btn');

    if (tweet === undefined) {
     vm.length = 140;
   } else {
     vm.length = length - tweet.length;
   }
   btn.classList.toggle('disabled', vm.length < 0);
 };

 function setMention(username){
  document.querySelector('#tweet-text').value = '@' + username + ' ';
  vm.calLength('@' + username, index);
}

function doTheJobs() {

  document.querySelector('.follower-before').style.display = 'none';
  document.querySelector('.follower-after').style.visibility = 'visible';

  BuzzerServices.doTheJobs()
  .success(get)
  .error(errorJob);

  function get(res) {
      // console.log("Timeline"); 
      // console.log(res);
    }

    function errorJob(err) {
      console.log("Error Do The Jobs")
      console.log(err);
    }
  }


  vm.postTweet = postTweet;
  function postTweet(data) {    
    var fd = new FormData();
    // fd.append('image', data.postImages[0].item);
    fd.append('image', data.image);
    fd.append('post',  data.tweet);
    fd.append('blast', false);
    fd.append('schedule', false);
    var config = {
      headers: {
        'Content-Type': undefined
      }
    }
    var urlImage = location.origin + '/api/create-post';
    console.log(fd);

    $http.post(urlImage, fd, config).success(function(response){
      $(".modal-buzzer").modal('hide');
      ActionService.Succesed('Success send post');
    }).error(function(response){
      // $uibModalInstance.close()
      $(".modal-buzzer").modal('hide');
      ActionService.Failed(response.message);
    });
  }


}
