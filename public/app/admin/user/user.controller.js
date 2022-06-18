angular.module('TwikipediaAdmin')
  .controller('UserCtrl', UserCtrl)
  .controller('UserAddCtrl', UserAddCtrl)
  .controller('UserUpdateCtrl', UserUpdateCtrl);

UserCtrl.$inject = ['UserService', 'NgTableParams', '$state', 'ActionService'];
function UserCtrl(UserService, NgTableParams, $state, ActionService) {
  var vm = this;

  UserService.getAllUser()
    .then(getAllUser);

  function getAllUser(response) {
    vm.user = response.data.data;
    console.log(vm.user);

    vm.tableUser = new NgTableParams({
      count: 5,
    }, {
      counts: [5, 10, 15],
      dataset: vm.user,
    });
  }

  vm.delete = function (id, name, index) {

    ActionService.Delete(deleteCallback, name);

    function deleteCallback() {
      UserService.deleteUser(id)
      .success(deleteUser)
      .error(errDeleteUser);
    }

    function deleteUser(response) {
      console.log(response);
      UserService.getAllUser().then(getAllUser);
    }

    function errDeleteUser(err) {
      ActionService.Failed(err.message);
    }
  };

  vm.update = update;
  function update(id) {
    $state.go('userUpdate', { id: id });
  }
}

UserAddCtrl.$inject = ['UserService', 'ActionService', '$state'];
function UserAddCtrl(UserService, ActionService, $state) {
  var vm = this;
  vm.title = 'Add New';

  console.log('USER ADD');
  vm.save = function (user) {

    UserService.addNewUser(user)
      .success(addNewUser)
      .error(errNewUser);

    function addNewUser(response) {
      ActionService.Succesed(`Success add user ${user.email}`);
      $state.go('user');
    }

    function errNewUser(error) {
      console.log(error);
      ActionService.Failed(error.message);
    }
  };

}

UserUpdateCtrl.$inject = ['UserService', '$state', 'ActionService'];
function UserUpdateCtrl(UserService, $state, ActionService) {
  var vm = this;
  var id = $state.params.id;
  vm.title = 'Update';

  UserService.getUserById(id).then(getUser);
  function getUser(response) {
    vm.data = response.data.data;
  }

  vm.save = save;
  function save(user) {
    UserService.updateUser(id, user)
      .success(updateUser)
      .error(errUpdateUser);

    function updateUser(response) {
      console.log(response);
      ActionService.Update(id);
      $state.go('user');
    }

    function errUpdateUser(err) {
      console.log(err);
      ActionService.Failed(err.message);
    }
  }
}
