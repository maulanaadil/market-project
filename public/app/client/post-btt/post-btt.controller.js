angular.module('TwikipediaClient')
  .controller('PostBttCtrl', PostBttCtrl);

PostBttCtrl.$inject = ['ScheduleService', 'ActionService'];

function PostBttCtrl(ScheduleService, ActionService) {
  var vm = this;
  vm.length = 140;
  vm.username = localStorage.getItem('username');
  var length = 140;

  var btn = document.querySelector('#tweet-btn');

  // TWEET LENGTH
  vm.calLength = function(tweet) {
    if (tweet === undefined) {
      vm.length = 140;
    } else {
      vm.length = length - tweet.length;
    }

    btn.classList.toggle('disabled', vm.length < 0);
  };

  vm.tweet = tweet;

  function tweet(data) {
    data.lat = Number(window.localStorage.getItem('lat'));
    data.long = Number(window.localStorage.getItem('long'));

    var date = document.querySelector('#btt-schedule').value;

    if ((date !== null) && (date !== '')) {
      date = new Date(date);
      date.setHours(Number(document.querySelector('#bestTimeLabel').innerHTML.replace('.00', '')));
      data.date = date;

      //console.log(data);
      ScheduleService.postScheduleTweet(data)
        .success(scheduleTweet)
        .error(errScheduleTweet);
    } else {
      ActionService.Failed('Date must filled');
    }

    function scheduleTweet(response) {
      ActionService.Succesed('Your best time to tweet will be post at schedule tweet');

      date = '';
      vm.post.schedule = false;
      vm.post.tweet = '';
        document.getElementById('twit').innerHTML = '';
    }

    function errScheduleTweet(err) {
      ActionService.Failed(err.message);
      console.log(err);
    }
  }
}