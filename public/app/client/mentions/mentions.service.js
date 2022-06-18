angular.module('TwikipediaClient')
  .factory('MentionService', MentionService);

  var urlMention = location.origin + '/api/mentions';
  MentionService.$inject = ['$http','$q'];
  
  function MentionService($http, $q){
      return {
          getMentions : getMentions,
      };
      function getMentions(){
            var def = $q.defer();

            return $http.get(urlMention)
            .success(userMentions)
            .error(errUserMentions);

            function userMentions(response) {
            def.resolve(response);
            }
            function errUserMentions() {
                def.reject('Error GET detail User');
            }
            return def.promise;
        }
  }