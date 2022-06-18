angular.module('TwikipediaAdmin')
  .factory('UserService', UserService);

var urlUser = location.origin + '/api/admin';

UserService.$inject = ['$q', '$http'];
function UserService($q, $http) {
  return {
    getAllUser: getAllUser,
    getUserById: getUserById,
    addNewUser: addNewUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
  };

  function getAllUser() {
    var def = $q.defer();

    return $http.get(urlUser)
      .success(allUser)
      .error(errorAllUser);

    function allUser(response) {
      def.resolve(response);
    }

    function errorAllUser() {
      def.reject('Error GET data User');
    }

    return def.promise;
  }

  function getUserById(id) {
    var def = $q.defer();

    return $http.get(urlUser + '/' + id)
      .success(User)
      .error(errorUser);

    function User(response) {
      def.resolve(response);
    }

    function errorUser() {
      def.reject('Error GET data User');
    }

    return def.promise;
  }

  function addNewUser(user) {
    return $http({
      method: 'POST',
      url: urlUser,
      data: user,
    });
  }

  function updateUser(id, user) {
    return $http({
      method: 'PUT',
      url: urlUser + '/' + id,
      data: user,
    });
  }

  function deleteUser(id) {
    return $http({
      method: 'DELETE',
      url: urlUser + '/' + id,
    });
  }
}
