angular.module('TwikipediaClient')
  .controller('MentionCtrl', MentionCtrl);

  MentionCtrl.$inject = ['MentionService', 'ActionService'];

  function MentionCtrl(MentionService, ActionService){
      var vm = this;

      vm.length = 140;
      vm.username = localStorage.getItem('username');
      var length = 140;
      MentionService.getMentions().then(getMentions);

      function getMentions(response){
          vm.mention = response.data.data;
          console.log(vm.mention);
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
