angular.module('TwikipediaClient')
  .controller('SearchCtrl', SearchCtrl);

SearchCtrl.$inject = ['SearchService', 'ActionService'];

function SearchCtrl(SearchService, ActionService) {
  var vm = this;

  vm.search = search;
  vm.length = 140;
  vm.username = localStorage.getItem('username');
  var length = 140;

  function search(query) {
    SearchService.searchAnything(query)
      .success(getData)
      .error(errService);
  }

  function getData(response) {
    vm.users = response.data;

    vm.result = response.statuses;
    vm.result.map(function (data, index) {
      vm.result[index].date = new Date(vm.result[index].created_at);
    });

    console.log(response);
  }

  vm.followUser = followUser;

  function followUser(id, index) {
    SearchService.followUser(id)
      .success(successFollow)
      .error(errFollow);

    function successFollow(response) {
      console.log(response);
      ActionService.Succesed(response.message);
      vm.result[index].user.following = true;
    }

    function errFollow(err) {
      console.log(err);
    }
  }

  vm.unfollowUser = unfollowUser;

  function unfollowUser(id, index) {
    SearchService.unfollowUser(id)
      .success(successUnfollow)
      .error(errUnfollow);

    function successUnfollow(response) {
      console.log(response);
      ActionService.Succesed(response.message);
      vm.result[index].user.following = false;

    }

    function errUnfollow(err) {
      console.log(err);
    }
  }

  function errService(err) {
    console.log(err);
  }

  // TWEET LENGTH
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

  vm.tweet = tweet;
  function tweet(index) {
    var text = document.querySelector('#tweet-' + index).value;

    data.tweet = text;

    ProfileService.postTweet(data)
        .success(postTweet)
        .error(errPostTweet);

    function postTweet(response) {
      ActionService.Succesed('Tweet has been posted');
    }

    function errPostTweet(err) {
      ActionService.Failed(err.message);
      console.log(err);
    }
  }
}
