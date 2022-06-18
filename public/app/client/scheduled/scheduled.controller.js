angular.module('TwikipediaClient')
  .controller('ScheduledCtrl', ScheduledCtrl);

ScheduledCtrl.$inject = ['ScheduleService', 'ActionService'];

function ScheduledCtrl(ScheduleService, ActionService) {
  var vm = this;

  var length = 140;

  vm.calLength = function (i, tweet) {
    if (tweet === undefined) {
      vm.length = 140;
    } else {
      vm.tweets[i].charLength = length - tweet.length;
    }

    btn.classList.toggle('disabled', vm.length < 0);
  };

  vm.profile = {
    picture: localStorage.getItem('picture'),
    name: localStorage.getItem('name'),
    username: localStorage.getItem('username'),
  };

  ScheduleService.getScheduleTweets()
    .then(getTweets);

  function getTweets(response) {
    vm.tweets = response.data.data;
    vm.tweets.map((tweet, i) => {
      vm.tweets[i].statusEdit = false;
      vm.tweets[i].charLength = 0;
    });

    //console.log(vm.tweets);
  }

  vm.deleteScheduledTweet = deleteScheduledTweet;

  function deleteScheduledTweet(index, id, tweet) {

    ActionService.Delete(deleteCallback, tweet);

    function deleteCallback() {
      ScheduleService.deleteScheduledTweet(id)
        .success(deleteScheduledTweetSuccsessInfo)
        .error(errorDeleteScheduledTweet);
    }

    function deleteScheduledTweetSuccsessInfo(response) {
      //console.log(response);
      vm.tweets.splice(index, 1);
    }

    function errorDeleteScheduledTweet(err) {
      console.log(err);
    }
  }

  vm.editScheduleTweet = editScheduleTweet;

  function editScheduleTweet(i, tweet) {
    vm.tweets[i].statusEdit = true;
    vm.tweets[i].charLength = length - tweet.length;
  }

  vm.saveEditScheduleTweet = saveEditScheduleTweet;

  function saveEditScheduleTweet(newTweet, id, index) {
    vm.tweets[index].statusEdit = false;
    vm.tweets[index].tweet = newTweet;

    ScheduleService.updateScheduleTweet(newTweet, id)
      .success(successUpdateTweet)
      .error(errUpdateTweet);

    function successUpdateTweet(response) {
      //console.log(response);
    }

    function errUpdateTweet(err) {
      console.log(err);
    }
  }
}
