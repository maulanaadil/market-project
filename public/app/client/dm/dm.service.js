angular.module('TwikipediaClient')
    .factory('DMService', DMService);

var urlDM = location.origin + '/api/dm';
DMService.$inject = ['$http', '$q'];

function DMService($http, $q) {
    return {
        getDM: getDM,
        sendDM : sendDM
    };
    function getDM() {
        var def = $q.defer();

        return $http.get(urlDM)
            .success(userDM)
            .error(errUserDM);

        function userDM(response) {
            def.resolve(response);
        }
        function errUserDM() {
            def.reject('Error GET direct messages');
        }
        return def.promise;
    }
    function sendDM(data) {

        return $http({
            method: 'POST',
            url: urlDM,
            data: data,
        });

    }
}