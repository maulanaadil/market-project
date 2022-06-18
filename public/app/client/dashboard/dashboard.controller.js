app = angular.module('TwikipediaClient')

app.controller('DashboardCtrl', DashboardCtrl)

app.directive('myRepeatDirective', myRepeatDirective)

function myRepeatDirective() {
  return function(scope, element, attrs) {
    if (scope.$last) {
      scope.$emit('LastElem');
    }
  }
}

DashboardCtrl.$inject = ['$scope', '$http'];

function DashboardCtrl($scope, $http) {
  var vm = this;
  $http.get(location.origin + '/api/count')
    .then(getCount);
  vm.count = null;

  $scope.resetFilter = function() {
    $('#trending-tag .dropdown-toggle').find('span.selected').html("All");
    $scope.filterCustom.source = ''
  }
  $scope.selected = function() {
    // data = event.target.value
    data = this.sosmed.source
    // console.log(data);
    $('#trending-tag .dropdown-toggle').find('span.selected').html(data);
    $scope.filterCustom.source = data
  }

  $scope.filterCustom = {
    source: ''
  }

  vm.post = {
    profileName: localStorage.getItem('name'),
    profileId: localStorage.getItem('username'),
    profilePhoto: localStorage.getItem('picture'),
    postlist: [{
        post: "Hello nikmati cashback dari kita hingga 20% mulai hari ini sampe minggu depan #CashBackEvStore",
        picture: [],
        comment: 23,
        like: 130,
        time: '2h'
      },
      {
        post: "Sepatu Nike Air Max ukuran 44 warna hitam siap kamu angkut sekarang juga.. yuk pesan di #EvStore",
        picture: ['https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/nike_nike-air-max-emergent-black-white-sepatu-basket-818954-001_full12.jpg'],
        comment: 23,
        like: 130,
        time: '5h'
      }
    ]
  }

  $http.get(location.origin + '/api/trends')
    .then(getTrends);

  function getTrends(response) {
    var a = response.data.data;
    var b = a[0].trends;
    console.log(b);
    vm.trend = {
      categories: [{
          source: 'Twitter',
          icon: 'fa fa-twitter'
        },
        {
          source: 'Facebook',
          icon: 'fa fa-facebook'
        },
        {
          source: 'Instagram',
          icon: 'fa fa-instagram'
        }
      ],
      trends: [
        {
          name :"Kaos Bamboo",
          promoted_content: null,
          query:"%23CemburuItu",
          tweet_volume: null,
          url:"http://twitter.com/search?q=%23CemburuItu"
        },
        {
          name :"Bali",
          promoted_content: null,
          query:"%23CemburuItu",
          tweet_volume: null,
          url:"http://twitter.com/search?q=%23CemburuItu"
        },
        {
          name :"King Mango Thai",
          promoted_content: null,
          query:"%23CemburuItu",
          tweet_volume: null,
          url:"http://twitter.com/search?q=%23CemburuItu"
        },
        {
          name :"Adidas",
          promoted_content: null,
          query:"%23CemburuItu",
          tweet_volume: null,
          url:"http://twitter.com/search?q=%23CemburuItu"
        },
        {
          name :"Real Madrid",
          promoted_content: null,
          query:"%23CemburuItu",
          tweet_volume: null,
          url:"http://twitter.com/search?q=%23CemburuItu"
        },
        {
          name :"The Teddy Bear Coat",
          promoted_content: null,
          query:"%23CemburuItu",
          tweet_volume: null,
          url:"http://twitter.com/search?q=%23CemburuItu"
        },
        {
          name :"Thai Tea",
          promoted_content: null,
          query:"%23CemburuItu",
          tweet_volume: null,
          url:"http://twitter.com/search?q=%23CemburuItu"
        },
        {
          name :"Parka",
          promoted_content: null,
          query:"%23CemburuItu",
          tweet_volume: null,
          url:"http://twitter.com/search?q=%23CemburuItu"
        }
      ]
    }
  }

  function getCount(response) {
    console.log(response);
    vm.count = response.data.follower;
  }
}
