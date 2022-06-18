angular.module('TwikipediaClient')
  .factory('UserNearbyService', UserNearbyService);

var urlGeoSearch = location.origin + '/api/twitter/search/geotes';

UserNearbyService.$inject = ['$q', '$http'];
function UserNearbyService($q, $http) {
  return {
    getUserByCurrentLocation: getUserByCurrentLocation,
  };

  function getUserByCurrentLocation(data) {
    return $http({
      method: 'POST',
      url: urlGeoSearch,
      data: data
    })
  }
}
