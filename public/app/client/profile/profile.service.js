angular.module('TwikipediaClient')
  .factory('ProfileService', ProfileService);

var urlUserProfile = location.origin + '/api/user';
var urlTweet = location.origin + '/api/user/post';
var urlImage = location.origin + '/api/user/post/image';

ProfileService.$inject = ['$http', '$q'];
function ProfileService($http, $q) {
  return {
    getUserProfile: getUserProfile,
    postTweet: postTweet,
    postImage : postImage,
  };

  function getUserProfile() {
    var def = $q.defer();

    return $http.get(urlUserProfile)
      .success(userProfile)
      .error(errUserProfile);

    function userProfile(response) {
      def.resolve(response);
    }

    function errUserProfile() {
      def.reject('Error GET detail User');
    }

    return def.promise;
  }

  function postTweet(tweet, textField) {
    return $http({
      method: 'POST',
      url: urlTweet,
      data: tweet,
    });
  }
  function postImage(tweet, textField){

    return $http({
      method : 'POST',
      url : urlImage,
      data : tweet
    });
  }

}
