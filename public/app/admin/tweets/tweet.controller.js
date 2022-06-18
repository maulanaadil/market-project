angular.module('TwikipediaAdmin')
  .controller('TweetCtrl', TweetCtrl)
  .controller('SearchUserCtrl', SearchUserCtrl)
  .controller('TrainingTweetCtrl', TrainingTweetCtrl);

TweetCtrl.$inject = ['TweetService', 'CategoryService', 'ActionService'];

function TweetCtrl(TweetService, CategoryService, ActionService) {
  var vm = this;

  CategoryService.getAllCategory()
    .then(getCategory);

  function getCategory(response) {
    vm.categories = response.data.data;
    console.log(vm.categories);
  }

  vm.search = search;

  function search(q) {
    q = escape(q);
    TweetService.searchTweets(q)
      .success(tweetsResult)
      .error(errSearchTweet);

    function tweetsResult(response) {
      console.log(response);
      vm.tweets = response.statuses;
      vm.tweets.map(function (data, index) {
        vm.tweets[index].statusAdd = false;
        vm.tweets[index].date = new Date(vm.tweets[index].created_at);
      });
    }

    function errSearchTweet(err) {
      console.log(err);
    }
  }

  vm.addToCategory = addToCategory;

  function addToCategory(tweet, category, i) {
    TweetService.addToCategory(tweet, category)
      .success(addedToCategoryTweets)
      .error(errAdded);

    function addedToCategoryTweets(response) {
      ActionService.Succesed(`Success added category ${category}`);
      vm.tweets[i].statusAdd = true;
      vm.tweets[i].category = category;
      console.log(i);
      console.log(vm.tweets[i]);
    }

    function errAdded(error) {
      ActionService.Failed(error.message);
    }
  }
}

TrainingTweetCtrl.$inject = ['TweetService', 'NgTableParams', 'ActionService'];

function TrainingTweetCtrl(TweetService, NgTableParams, ActionService) {
  var vm = this;

  TweetService.getAllTrainingTweets()
    .then(getTrainingTweets);

  function getTrainingTweets(response) {
    vm.trainingTweets = response.data.data;

    vm.tableTrainingTweets = new NgTableParams({
      count: 5,
    }, {
      counts: [5, 10, 15],
      dataset: vm.trainingTweets,
    });
  }

  vm.delete = function (id, index) {

    ActionService.Delete(deleteCallback, id);

    function deleteCallback() {
      TweetService.deleteTrainingTweetById(id)
        .success(trainingTweetDeleted)
        .error(errDeleteTrainingTweet);
    }

    function trainingTweetDeleted(response) {
      TweetService.getAllTrainingTweets()
        .then(getTrainingTweets);
    }

    function errDeleteTrainingTweet(err) {
      ActionService.Failed(err.message);
    }
  };
}

SearchUserCtrl.$inject = ['TweetService', 'CategoryService', 'ActionService'];
function SearchUserCtrl(TweetService, CategoryService, ActionService) {
  var vm = this;

  CategoryService.getAllCategory()
    .then(getCategory);

  function getCategory(response) {
    vm.categories = response.data.data;
  }

  vm.addToCategory = addToCategory;
  function addToCategory(id, category, index) {
    TweetService.addTimelineToCategory(id, category)
      .success((res) => ActionService.Succesed(res.message))
      .error(err => ActionService.Failed(err.message));
  }

  vm.search = search;
  function search(query) {
    TweetService.searchUsers(query)
      .success(resultUserSearch)
      .error(errResultSearch);
    
    function resultUserSearch(response) {
      vm.users = response.data;
    }

    function errResultSearch(err) {
      ActionService.Failed(err.message);
    }
  }
}