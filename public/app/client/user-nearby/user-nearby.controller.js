angular.module('TwikipediaClient')
  .controller('UserNearbyCtrl', UserNearbyCtrl)

UserNearbyCtrl.$inject = ['UserNearbyService', 'ActionService', 'ProfileService','SearchUserService','$http'];
function UserNearbyCtrl(UserNearbyService, ActionService, ProfileService, SearchUserService, $http) {
  var vm = this;
  vm.length = 140;
  vm.username = localStorage.getItem('username');
  vm.ava = localStorage.getItem('picture');
  var length = 140;
  vm.test = function($index){
    console.log('indexnya'+$index);
  }
  // TWEET LENGTHs
  vm.calLength = function (tweet, $index) {
   var btn = document.querySelector('#tweet-btn' + $index);

    if (tweet === undefined) {
      vm.length = 140;
    } else {
      vm.length = length - tweet.length;
    }

    btn.classList.toggle('disabled', vm.length < 0);
  };

  vm.setMention = setMention;
  function setMention(username, index) {
    document.querySelector('#tweet-' + index).value = '@' + username + ' ';

    vm.calLength('@' + username, index);
  }

  var data = {
    lat : Number(window.localStorage.getItem('lat')),
    long : Number(window.localStorage.getItem('long')),
  };

  vm.tweet = tweet;
  function tweet($index,data) {
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
    $http.post(urlImage, fd, config).success(function(response){
      // $uibModalInstance.close()
      ActionService.Succesed('Success send post');
      console.log($index);
      $('#modalUserNearby-'+$index).modal('hide');
    }).error(function(response){
      // $uibModalInstance.close()
      ActionService.Failed(response.message);
    });
  }

  UserNearbyService.getUserByCurrentLocation(data)
    .success(getUsers)
    .error(errGetUsers);

  function getUsers(response) {
    // console.log(response);
    var users = [];
    var data = response.data;
    var jarak = [];
    data.map(user => {
      users.push(user);
      jarak.push({jarak : (Math.random() * (10 - 0.1) + 0.1).toFixed(1)});
    });
    console.log(users.length);
    vm.users = users;
    vm.jarak = jarak;
    vm.lokasiMe = response.lokasi;

  }

  function errGetUsers(err) {
    console.log("Error Bro");
    ActionService.Failed(err.message);
  }

  vm.addToCategory = addToCategory;
  function addToCategory(userId) {
    SearchUserService.addFollowerTimeline(userId)
      .success(addedResponse)
      .error(errAdd);

    function addedResponse(response) {
      ActionService.Succesed(response.message)
    }

    function errAdd(err) {
      ActionService.Failed(response.message);
    }
  }
  vm.followUsers = followUsers;
  function followUsers(userId,index) {
    SearchUserService.followUser(userId)
      .success(addedResponse)
      .error(errAdd);

    function addedResponse(response) {
      ActionService.Succesed(response.message);
      vm.users[index].following = true;
    }

    function errAdd(err) {
      ActionService.Failed(response.message);
    }
  }

  vm.unfollowUser = unfollowUser;

  function unfollowUser(id, index) {
    SearchUserService.unfollowUser(id)
      .success(successUnfollow)
      .error(errUnfollow);

    function successUnfollow(response) {
      console.log(response);
      ActionService.Succesed(response.message);
      vm.users[index].following = false;

    }

    function errUnfollow(err) {
      console.log(err);
    }
   }
}
