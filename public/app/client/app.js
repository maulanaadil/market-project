angular.module('TwikipediaClient', ['ui.router', 'ngTable', 'oitozero.ngSweetAlert','file-model', 'ui.bootstrap'])
  .config(configuration);

configuration.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

function configuration($stateProvider, $urlRouterProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: '../../app/client/dashboard/dashboard.html',
      controller: 'DashboardCtrl',
      controllerAs: 'dashboard',
    })
    .state('profile', {
      url: '/',
      templateUrl: '../../app/client/profile/profile.html',
      controller: 'ProfileCtrl',
      controllerAs: 'profile',
    })
    .state('search', {
      url: '/search',
      templateUrl: '../../app/client/search/search.html',
      controller: 'SearchCtrl',
      controllerAs: 'search',
    })
    .state('follower-lists', {
      url: '/followers',
      templateUrl: '../../app/client/followers/followers.html',
      controller: 'FollowersCtrl',
      controllerAs: 'followers',
    })
    .state('scheduled', {
      url: '/scheduled',
      templateUrl: '../../app/client/scheduled/scheduled.html',
      controller: 'ScheduledCtrl',
      controllerAs: 'scheduled',
    })
    .state('search-user', {
      url: '/search/user',
      templateUrl: '../app/client/search-user/search-user.html',
      controller: 'SearchUserCtrl',
      controllerAs: 'searchUser',
    })
    .state('post-blast', {
      url: '/post/blast',
      templateUrl: '../app/client/post-blast/post-blast.html',
      controller: 'PostBlastCtrl',
      controllerAs: 'postBlast',
    })
    .state('post-btt', {
      url: '/post/btt',
      templateUrl: '../app/client/post-btt/post-btt.html',
      controller: 'PostBttCtrl',
      controllerAs: 'postBtt',
    })
    .state('user-nearby', {
      url: '/user/nearby',
      templateUrl: '../app/client/user-nearby/user-nearby.html',
      controller: 'UserNearbyCtrl',
      controllerAs: 'userNearby',
    })
    .state('mentions', {
      url: '/user/mentions',
      templateUrl: '../app/client/mentions/mentions.html',
      controller: 'MentionCtrl',
      controllerAs: 'mentions',
    }).state('buzzer', {
      url: '/user/buzzer',
      templateUrl: '../app/client/buzzer/buzzer.html',
      controller: 'BuzzerCtrl',
      controllerAs: 'buzzer',
    }).state('direct-messages', {
      url: '/user/direct-messages',
      templateUrl: '../app/client/dm/dm.html',
      controller: 'DMCtrl',
      controllerAs: 'dms',
    }).state('persona', {
      url: '/persona',
      templateUrl: '../app/client/persona/persona.html',
      controller: 'PersonaCtrl',
      controllerAs: 'persona',
    }).state('persona-detail', {
      url: '/persona-detail/:id',
      templateUrl: '../app/client/persona-detail/persona-detail.html',
      controller: 'PersonaDetailCtrl',
      controllerAs: 'personadetail',
    }).state('keyword', {
      url: '/keyword',
      templateUrl: '../app/client/keyword/keyword.html',
      controller: 'KeywordCtrl',
      controllerAs: 'keyword',
    }).state('content-performance', {
      url: '/content-performance',
      templateUrl: '../app/client/content-performance/content-performance.html',
      controller: 'ContentCtrl',
      controllerAs: 'content',
    }).state('content-performance-detail', {
      url: '/content-performance-detail/:id',
      templateUrl: '../app/client/content-performance-detail/content-performance-detail.html',
      controller: 'ContentPerformanceDetailCtrl',
      controllerAs: 'contentperformancedetail',
    })
    .state('create-ads', {
      url: '/create-ads',
      templateUrl: '../app/client/create-ads/create-ads.html',
      controller: 'AdsController',
      controllerAs: 'AdsCtrl',
    });
}
