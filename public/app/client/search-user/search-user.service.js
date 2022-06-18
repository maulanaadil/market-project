angular.module('TwikipediaClient')
  .factory('SearchUserService', SearchUserService);

var urlSearch = location.origin + '/api/twitter/search';
var urlCategory = location.origin + '/api/category';
var urlAddTimeline = location.origin + '/api/user/followers/timeline/add';
var urlFollow = location.origin + '/api/twitter/follow/';

SearchUserService.$inject = ['$q', '$http'];
function SearchUserService($q, $http) {
  return {
    getAllCategory: getAllCategory,
    searchUsers: searchUsers,
    addFollowerTimeline: addFollowerTimeline,
    followUser : followUser,
    unfollowUser : unfollowUser
  };

  function getAllCategory() {
    var def = $q.defer();

    return $http.get(urlCategory)
      .success(allCategory)
      .error(errorAllCategory);

    function allCategory(response) {
      def.resolve(response);
    }

    function errorAllCategory() {
      def.reject('Error GET data Category');
    }

    return def.promise;
  }

  function searchUsers(query) {
    return $http({
      method: 'POST',
      url: urlSearch + '?q=' + query + '&type=user',
    });
  }
  function followUser(userId){
     return $http({
      method: 'POST',
      url: urlFollow + userId,
    });
  }
  function unfollowUser(id) {
    return $http({
      method: 'POST',
      url: urlTwitter + 'unfollow/' + id,
    });
  }
  function addFollowerTimeline(userId) {
    var data = {
      user_id: userId
    };

    return $http({
      method: 'POST',
      url: urlAddTimeline,
      data: data,
    });
  }
}
