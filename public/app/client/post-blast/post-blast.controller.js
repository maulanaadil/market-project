angular.module('TwikipediaClient')
  .controller('PostBlastCtrl', PostBlastCtrl);

PostBlastCtrl.$inject = ['SearchUserService', 'ActionService', 'PostBlastService'];

function PostBlastCtrl(SearchUserService, ActionService, PostBlastService) {
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

  // ADD FORMAT MENTION
  vm.addFormatMention = addFormatMention;

  function addFormatMention() {
    var tweet = document.querySelector('#tweet');

    tweet.value += '${mention}';
    vm.calLength(tweet.value);
  }

  vm.listTweet = [];

  // SEE TWEET
  vm.seeTweet = seeTweet;

  function seeTweet() {
    var tweet = document.querySelector('#tweet').value;

    if (vm.followers === undefined) {
      ActionService.Failed('Select category first!');
    } else if (vm.followers.length === 0) {
      ActionService.Failed('User not found!');
    } else {
      vm.listTweet = [];
      vm.followers.map((user) => {
        //console.log(user)
        vm.listTweet.push({
          to: '@' + user.userDetail.screenName,
          tweet: tweet.replace(/\${mention}/g, '@' + user.userDetail.screenName),
          id: user.userDetail.userId,
          image: user.userDetail.image
        });
      });

      window.listTweet = vm.listTweet;
      //console.log(vm.listTweet);
    }
  }

  vm.blastTweet = blastTweet;

  function blastTweet(listTweet) {
    //console.log(listTweet);
    PostBlastService.blastTweet(listTweet)
      .success(function(response) {
        ActionService.Succesed(response.message);
        document.getElementById('twit').innerHTML = '';
        // vm.listTweet = [];
      });
  }

  // GET CATEGORY
  SearchUserService.getAllCategory()
    .then(getCategory);

  function getCategory(response) {
    vm.categories = response.data.data;
  }

  // GET ALL FOLLOWERS BY CATEGORY
  vm.getFollowerCategory = getFollowerCategory;

  function getFollowerCategory() {
    vm.selectedCategory = document.querySelector('#selectedCategory').value;
    //console.log(vm.selectedCategory);

    PostBlastService.getUserFollowersByCategory(vm.selectedCategory)
      .then(getUserCategory);
  }

  function getUserCategory(response) {
    //console.log(response);
    if (vm.listTweet !== undefined) {
      vm.listTweet.splice(0, vm.listTweet.length);
    }
    vm.followers = response.data.followers;
  }
}
