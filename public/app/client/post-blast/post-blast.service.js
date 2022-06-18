angular.module('TwikipediaClient')
  .factory('PostBlastService', PostBlastService);

var urlFollowersCategory = location.origin + '/api/user/followers/category/';
var urlBlastTweet = location.origin + '/api/user/blast/post';

PostBlastService.$inject = ['$q', '$http'];
function PostBlastService($q, $http) {
  return {
    getUserFollowersByCategory: getUserFollowersByCategory,
    blastTweet: blastTweet,
  };

  function getUserFollowersByCategory(category) {
    var def = $q.defer();

    return $http.get(urlFollowersCategory + category)
      .success(FollowerCategory)
      .error(errorFollowerCategory);

    function FollowerCategory(response) {
      def.resolve(response);
    }

    function errorFollowerCategory() {
      def.reject('Error GET data Category');
    }

    return def.promise;
  }

  function blastTweet(listTweet) {
    return $http({
      method: 'POST',
      url: urlBlastTweet,
      data: listTweet,
    });
  }
}