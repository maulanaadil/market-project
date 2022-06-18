angular.module('TwikipediaClient')
  .factory('ScheduleService', ScheduleService);

var urlScheduleTweet = location.origin + '/api/user/post/schedule';
var urlScheduleImage = location.origin + '/api/user/post/schedule/image';

ScheduleService.$inject = ['$http', '$q'];
function ScheduleService($http, $q) {
  return {
    getScheduleTweets: getScheduleTweets,
    postScheduleTweet: postScheduleTweet,
    updateScheduleTweet: updateScheduleTweet,
    deleteScheduledTweet: deleteScheduledTweet,
    postScheduleImg : postScheduleImg,
  };

  function getScheduleTweets() {
    var def = $q.defer();

    return $http.get(urlScheduleTweet)
      .success(userSchedule)
      .error(errUserSchedule);

    function userSchedule(response) {
      def.resolve(response);
    }

    function errUserSchedule() {
      def.reject('Error GET detail User');
    }

    return def.promise;
  }

  function postScheduleTweet(tweet, textField) {
    return $http({
      method: 'POST',
      url: urlScheduleTweet,
      data: tweet,
    });
  }
  function postScheduleImg(tweet, textField) {
      return $http({
        method: 'POST',
        url: urlScheduleImage,
        data: tweet,
      });
    }
  function updateScheduleTweet(tweet, id) {
    var data = {
      tweet: tweet,
    };
    return $http({
      method: 'PUT',
      url: urlScheduleTweet + '/' + id,
      data: data,
    });
  }

  function deleteScheduledTweet(id) {
    return $http({
      url: urlScheduleTweet + '/' + id,
      method: 'DELETE',
    });
  }
}
