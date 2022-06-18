angular.module('TwikipediaClient')
  .controller('SearchUserCtrl', SearchUserCtrl);

SearchUserCtrl.$inject = ['SearchUserService', 'ActionService'];
function SearchUserCtrl(SearchUserService, ActionService) {
  var vm = this;

  vm.search = searchUser;

  function searchUser(query) {

    SearchUserService.getAllCategory()
      .then(getAllCategory);

    SearchUserService.searchUsers(query)
      .success(getData)
      .error(errSearch);

    function successSearch(response) {
      if(response.statusCode === 204) {
        ActionService.Failed(response.message);
      } else {
        vm.users = response.data;
      }
    }
    function getData(response) {
      if(response.statusCode === 204) {
        ActionService.Failed(response.message);
      } else {
        vm.users = response.data;
      }
    
     }
    function getAllCategory(response) {
      vm.categories = response.data.data;
    }

    function errSearch(err) {
      console.log(err);
    }
  }

  vm.addToCategory = addToCategory;
  function addToCategory(userId) {
    SearchUserService.addFollowerTimeline(userId)
      .success(addedResponse)
      .error(errAdd);

    function addedResponse(response) {
      ActionService.Succesed(response.message)
    }

    function errAdd(err) {
      ActionService.Failed(response.message);
    }
  }
  vm.followUsers = followUsers;
  function followUsers(userId,index) {
    SearchUserService.followUser(userId)
      .success(addedResponse)
      .error(errAdd);

    function addedResponse(response) {
      ActionService.Succesed(response.message);
      vm.users[index].following = true;
    }

    function errAdd(err) {
      ActionService.Failed(response.message);
    }
  }

  vm.unfollowUser = unfollowUser;

  function unfollowUser(id, index) {
    SearchUserService.unfollowUser(id)
      .success(successUnfollow)
      .error(errUnfollow);

    function successUnfollow(response) {
      console.log(response);
      ActionService.Succesed(response.message);
      vm.users[index].following = false;

    }

    function errUnfollow(err) {
      console.log(err);
    }
  }
}
