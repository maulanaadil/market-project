angular.module('TwikipediaAdmin',
  ['ui.router', 'ngTable', 'oitozero.ngSweetAlert'])
  .config(configuration);

configuration.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
function configuration($stateProvider, $urlRouterProvider, $locationProvider) {

  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('dashboard', {
      url: '/',
      templateUrl: '../../app/admin/dashboard/dashboard.html',
      controller: 'DashboardCtrl',
      controllerAs: 'dashboard',
    })
    .state('category', {
      url: '/category',
      templateUrl: '../../app/admin/category/category.html',
      controller: 'CategoryCtrl',
      controllerAs: 'category',
    })
    .state('categoryAdd', {
      url: '/category/add',
      templateUrl: '../../app/admin/category/category-add.html',
      controller: 'CategoryAddCtrl',
      controllerAs: 'categoryAdd',
    })
    .state('preprocessing', {
      url: '/preprocessing',
      templateUrl: '../../app/admin/preprocessing/preprocessing.html',
      controller: 'PreprocessingCtrl',
      controllerAs: 'preprocessing',
    })
    .state('crawl', {
      url: '/crawl',
      templateUrl: '../../app/admin/crawl/crawl.html',
      controller: 'CrawlCtrl',
      controllerAs: 'crawl',
    })
    .state('crawlAdd', {
      url: '/crawl/add',
      templateUrl: '../../app/admin/crawl/crawl-add.html',
      controller: 'CrawlAddCtrl',
      controllerAs: 'crawlAdd',
    })
    .state('searchTweet', {
      url: '/search/tweet',
      templateUrl: '../../app/admin/tweets/tweets.html',
      controller: 'TweetCtrl',
      controllerAs: 'tweet',
    })
    .state('searchUser', {
      url: '/search/user',
      templateUrl: '../../app/admin/tweets/user.html',
      controller: 'SearchUserCtrl',
      controllerAs: 'searchUser',
    })
    .state('trainingTweet', {
      url: '/tweet/training',
      templateUrl: '../../app/admin/tweets/training.html',
      controller: 'TrainingTweetCtrl',
      controllerAs: 'training',
    })
    .state('user', {
      url: '/user',
      templateUrl: '../../app/admin/user/user.html',
      controller: 'UserCtrl',
      controllerAs: 'user',
    })
    .state('userAdd', {
      url: '/user/add',
      templateUrl: '../../app/admin/user/user-add.html',
      controller: 'UserAddCtrl',
      controllerAs: 'userAdd',
    })
    .state('userUpdate', {
      url: '/user/:id/update',
      templateUrl: '../../app/admin/user/user-add.html',
      controller: 'UserUpdateCtrl',
      controllerAs: 'userAdd',
    });
}
