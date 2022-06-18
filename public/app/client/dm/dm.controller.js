angular.module('TwikipediaClient')
  .controller('DMCtrl', DMCtrl);

  DMCtrl.$inject = ['DMService', 'ActionService'];

  function DMCtrl(DMService, ActionService){
      var vm = this;
      var dm = [];
      vm.length = 140;
      vm.username = localStorage.getItem('username');
      var length = 140;
      DMService.getDM().then(getDM);

      function getDM(response){
          vm.dm = response.data.data;
          dm.push(response.data.data);
          console.log(vm.dm);
      }


      vm.tweet = tweet;
      function tweet(index,id) {
        var text = document.querySelector('#tweet-' + index).value;
        console.log(text);
        var data = {
          "message" : text,
          "user_id" :  id
        };
        
        console.log(data);
        DMService.sendDM(data)
            .success(postTweet)
            .error(errPostTweet);

        function postTweet(response) {
          ActionService.Succesed('DM has been sent .');
        }

        function errPostTweet(err) {
          ActionService.Failed(err.message);
          console.log(err);
        }
      }
  }
