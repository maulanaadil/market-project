angular.module('TwikipediaAdmin')
  .controller('PreprocessingCtrl', PreprocessingCtrl);

PreprocessingCtrl.$inject = ['PreprocessingService', 'ActionService'];
function PreprocessingCtrl(PreprocessingService, ActionService) {
  var vm = this;

  vm.tweets = tweets;
  function tweets() {
    PreprocessingService.preprocessingTweets()
      .success(successPrepros)
      .error(errPrepros);

    function successPrepros(response) {
      ActionService.Succesed(response.message);
    }

    function errPrepros(err) {
      console.log(err);
    }
  }

  vm.wikipedia = wikipedia;
  function wikipedia() {
    PreprocessingService.preprocessingWikipedia()
    .success(successPrepros)
    .error(errPrepros);

    function successPrepros(response) {
      ActionService.Succesed(response.message);
    }

    function errPrepros(err) {
      ActionService.Failed(err.message);
    }
  }

}
